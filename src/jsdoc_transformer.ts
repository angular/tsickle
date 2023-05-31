/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview jsdoc_transformer contains the logic to add JSDoc comments to TypeScript code.
 *
 * One of tsickle's features is to add Closure Compiler compatible JSDoc comments containing type
 * annotations, inheritance information, etc., onto TypeScript code. This allows Closure Compiler to
 * make better optimization decisions compared to an untyped code base.
 *
 * The entry point to the annotation operation is jsdocTransformer below. It adds synthetic comments
 * to existing TypeScript constructs, for example:
 *     const x: number = 1;
 * Might get transformed to:
 *     /.. \@type {number} ./
 *     const x: number = 1;
 * Later TypeScript phases then remove the type annotation, and the final emit is JavaScript that
 * only contains the JSDoc comment.
 *
 * To handle certain constructs, this transformer also performs AST transformations, e.g. by adding
 * CommonJS-style exports for type constructs, expanding `export *`, parenthesizing casts, etc.
 */

import * as ts from 'typescript';

import {AnnotatorHost, moduleNameAsIdentifier} from './annotator_host';
import {hasExportingDecorator} from './decorators';
import {GoogModuleProcessorHost} from './googmodule';
import * as jsdoc from './jsdoc';
import {ModuleTypeTranslator} from './module_type_translator';
import * as transformerUtil from './transformer_util';
import {getPreviousDeclaration, isMergedDeclaration, symbolIsValue} from './transformer_util';
import {isValidClosurePropertyName} from './type_translator';

function addCommentOn(
    node: ts.Node, tags: jsdoc.Tag[], escapeExtraTags?: Set<string>,
    hasTrailingNewLine = true) {
  const comment =
      jsdoc.toSynthesizedComment(tags, escapeExtraTags, hasTrailingNewLine);
  const comments = ts.getSyntheticLeadingComments(node) || [];
  comments.push(comment);
  ts.setSyntheticLeadingComments(node, comments);
  return comment;
}

type HasTypeParameters =
    ts.InterfaceDeclaration|ts.ClassLikeDeclaration|ts.TypeAliasDeclaration|ts.SignatureDeclaration;

/** Adds an \@template clause to docTags if decl has type parameters. */
export function maybeAddTemplateClause(docTags: jsdoc.Tag[], decl: HasTypeParameters) {
  if (!decl.typeParameters) return;
  // Closure does not support template constraints (T extends X), these are ignored below.
  docTags.push({
    tagName: 'template',
    text: decl.typeParameters.map(tp => transformerUtil.getIdentifierText(tp.name)).join(', ')
  });
}

/**
 * Adds heritage clauses (\@extends, \@implements) to the given docTags for
 * decl. Used by jsdoc_transformer and externs generation.
 */
export function maybeAddHeritageClauses(
    docTags: jsdoc.Tag[], mtt: ModuleTypeTranslator,
    decl: ts.ClassLikeDeclaration|ts.InterfaceDeclaration) {
  if (!decl.heritageClauses) return;
  const isClass = decl.kind === ts.SyntaxKind.ClassDeclaration;
  const hasAnyExtends = decl.heritageClauses.some(c => c.token === ts.SyntaxKind.ExtendsKeyword);
  for (const heritage of decl.heritageClauses) {
    const isExtends = heritage.token === ts.SyntaxKind.ExtendsKeyword;
    for (const expr of heritage.types) {
      addHeritage(isExtends ? 'extends' : 'implements', expr);
    }
  }

  /**
   * Adds the relevant Closure JSdoc tags for an expression occurring in a
   * heritage clause, e.g. "implements FooBar" => "@implements {FooBar}".
   *
   * Will omit the JSDoc and add a comment saying why if the expression is
   * inexpressible in Closure semantics.
   *
   * Note that we don't need to consider all possible combinations of
   * types/values and extends/implements because our input is already verified
   * to be valid TypeScript.  See test_files/class/ for the full cartesian
   * product of test cases.
   *
   * In some cases adding the Closure JSDoc tags is unnecessary, like in
   *   "class Foo {} /** @extends {Foo} * / class Bar extends Foo {}"
   * but having the extra tag doesn't affect Closure Compiler typechecking
   * semantics.
   */
  function addHeritage(
      relation: 'extends'|'implements', expr: ts.ExpressionWithTypeArguments): void {
    const supertype = mtt.typeChecker.getTypeAtLocation(expr);
    // We ultimately need to have a named type in the JSDoc, so verify that
    // the resolved type maps back to some specific symbol.
    // You cannot @implements an anonymous record type, for example.
    if (!supertype.symbol) {
      warn(`type without symbol`);
      return;
    }
    if (!supertype.symbol.name) {
      warn(`type without symbol name`);
      return;
    }
    if (supertype.symbol.flags & ts.SymbolFlags.TypeLiteral) {
      // A type literal is a type like `{foo: string}`.
      // These can come up as the output of a mapped type.
      warn(`dropped ${relation} of a type literal: ${expr.getText()}`);
      return;
    }

    // Translate the reference to the parent into the type expression used
    // in the @extends/@implements JSDoc.
    // Normally we'd use mtt.typeToClosure for type translation, but two
    // caveats:
    // 1) We need to avoid
    //    https://github.com/microsoft/TypeScript/issues/38391
    // 2) We can't emit a leading ! in the type reference.  So
    //      @extends {X<!Y>}, not @extends {!X<!Y>}.
    const typeTranslator = mtt.newTypeTranslator(expr);
    // Workaround for #1, see also the definition of dropFinalTypeArgument
    // for why we use this.
    typeTranslator.dropFinalTypeArgument = true;

    let closureType = typeTranslator.translate(supertype);
    if (closureType === '?') {
      warn(`{?} type`);
      return;
    }
    // Workaround for #2
    closureType = closureType.replace(/^!/, '');

    // Choose the @tag to use.  For the (questionable) reasons described in
    // this block, sometimes we emit @extends even if the TS code uses
    // 'implements'.
    let tagName = relation;
    if (supertype.symbol.flags & ts.SymbolFlags.Class) {
      if (!isClass) {
        warn(`interface cannot extend/implement class`);
        return;
      }
      if (relation !== 'extends') {
        if (!hasAnyExtends) {
          // A special case: for a class that has no existing 'extends' clause
          // but does have an 'implements' clause that refers to another
          // class, we change it to instead be an 'extends'.  This was a
          // poorly-thought-out hack that may actually cause compiler bugs:
          //   https://github.com/google/closure-compiler/issues/3126
          // but we have code that now relies on it, ugh.
          tagName = 'extends';
        } else {
          warn(`cannot implements a class`);
          return;
        }
      }
    }

    docTags.push({
      tagName,
      type: closureType,
    });

    /** Records a warning, both in the source text and in the emit host. */
    function warn(message: string) {
      message = `dropped ${relation}: ${message}`;
      docTags.push({tagName: '', text: `tsickle: ${message}`});
      mtt.debugWarn(decl, message);
    }
  }
}

/**
 * createMemberTypeDeclaration emits the type annotations for members of a class. It's necessary in
 * the case where TypeScript syntax specifies there are additional properties on the class, because
 * to declare these in Closure you must declare these separately from the class.
 *
 * createMemberTypeDeclaration produces an if (false) statement containing property declarations, or
 * null if no declarations could or needed to be generated (e.g. no members, or an unnamed type).
 * The if statement is used to make sure the code is not executed, otherwise property accesses could
 * trigger getters on a superclass. See test_files/fields/fields.ts:BaseThatThrows.
 */
function createMemberTypeDeclaration(
    mtt: ModuleTypeTranslator,
    typeDecl: ts.ClassDeclaration|ts.InterfaceDeclaration): ts.IfStatement|null {
  // Gather parameter properties from the constructor, if it exists.
  const ctors: ts.ConstructorDeclaration[] = [];
  let paramProps: ts.ParameterDeclaration[] = [];
  const nonStaticProps: ClosureProperty[] = [];
  const staticProps: ClosureProperty[] = [];
  const unhandled: ts.NamedDeclaration[] = [];
  const abstractMethods: ts.FunctionLikeDeclaration[] = [];
  for (const member of typeDecl.members) {
    if (member.kind === ts.SyntaxKind.Constructor) {
      ctors.push(member as ts.ConstructorDeclaration);
    } else if (
        ts.isPropertyDeclaration(member) || ts.isPropertySignature(member) ||
        (ts.isMethodDeclaration(member) && member.questionToken)) {
      const isStatic =
          transformerUtil.hasModifierFlag(member, ts.ModifierFlags.Static);
      if (isStatic) {
        staticProps.push(member);
      } else {
        nonStaticProps.push(member);
      }
    } else if (
        member.kind === ts.SyntaxKind.MethodDeclaration ||
        member.kind === ts.SyntaxKind.MethodSignature ||
        member.kind === ts.SyntaxKind.GetAccessor ||
        member.kind === ts.SyntaxKind.SetAccessor) {
      if (transformerUtil.hasModifierFlag(member, ts.ModifierFlags.Abstract) ||
          ts.isInterfaceDeclaration(typeDecl)) {
        abstractMethods.push(
            member as ts.MethodDeclaration | ts.GetAccessorDeclaration |
            ts.SetAccessorDeclaration);
      }
      // Non-abstract methods only exist on classes, and are handled in regular
      // emit.
    } else {
      unhandled.push(member);
    }
  }

  if (ctors.length > 0) {
    // Only the actual constructor implementation, which must be last in a potential sequence of
    // overloaded constructors, may contain parameter properties.
    const ctor = ctors[ctors.length - 1];
    paramProps = ctor.parameters.filter(
        p => transformerUtil.hasModifierFlag(p, ts.ModifierFlags.ParameterPropertyModifier));
  }

  if (nonStaticProps.length === 0 && paramProps.length === 0 && staticProps.length === 0 &&
      abstractMethods.length === 0) {
    // There are no members so we don't need to emit any type
    // annotations helper.
    return null;
  }

  if (!typeDecl.name) {
    mtt.debugWarn(typeDecl, 'cannot add types on unnamed declarations');
    return null;
  }

  const className = transformerUtil.getIdentifierText(typeDecl.name);
  const staticPropAccess = ts.factory.createIdentifier(className);
  const instancePropAccess =
      ts.factory.createPropertyAccessExpression(staticPropAccess, 'prototype');
  // Closure Compiler will report conformance errors about this being unknown type when emitting
  // class properties as {?|undefined}, instead of just {?}. So make sure to only emit {?|undefined}
  // on interfaces.
  const isInterface = ts.isInterfaceDeclaration(typeDecl);
  const propertyDecls = staticProps.map(
      p => createClosurePropertyDeclaration(
          mtt, staticPropAccess, p, isInterface && !!p.questionToken));
  propertyDecls.push(...[...nonStaticProps, ...paramProps].map(
      p => createClosurePropertyDeclaration(
          mtt, instancePropAccess, p, isInterface && !!p.questionToken)));
  propertyDecls.push(...unhandled.map(
      p => transformerUtil.createMultiLineComment(
          p, `Skipping unhandled member: ${escapeForComment(p.getText())}`)));

  for (const fnDecl of abstractMethods) {
    // If the function declaration is computed, its name is the computed expression; otherwise, its
    // name can be resolved to a string.
    const name = fnDecl.name && ts.isComputedPropertyName(fnDecl.name) ? fnDecl.name.expression :
                                                                         propertyName(fnDecl);
    if (!name) {
      mtt.error(fnDecl, 'anonymous abstract function');
      continue;
    }
    const {tags, parameterNames} = mtt.getFunctionTypeJSDoc([fnDecl], []);
    if (hasExportingDecorator(fnDecl, mtt.typeChecker)) tags.push({tagName: 'export'});
    // Use element access instead of property access for computed names.
    const lhs = typeof name === 'string' ?
        ts.factory.createPropertyAccessExpression(instancePropAccess, name) :
        ts.factory.createElementAccessExpression(instancePropAccess, name);
    // memberNamespace because abstract methods cannot be static in TypeScript.
    const abstractFnDecl =
        ts.factory.createExpressionStatement(ts.factory.createAssignment(
            lhs,
            ts.factory.createFunctionExpression(
                /* modifiers */ undefined,
                /* asterisk */ undefined,
                /* name */ undefined,
                /* typeParameters */ undefined,
                parameterNames.map(
                    n => ts.factory.createParameterDeclaration(
                        /* modifiers */ undefined,
                        /* dotDotDot */ undefined, n)),
                undefined,
                ts.factory.createBlock([]),
                )));
    ts.setSyntheticLeadingComments(abstractFnDecl, [jsdoc.toSynthesizedComment(tags)]);
    propertyDecls.push(ts.setSourceMapRange(abstractFnDecl, fnDecl));
  }

  // Wrap the property declarations in an 'if (false)' block.
  // See test_files/fields/fields.ts:BaseThatThrows for a note on this wrapper.
  const ifStmt = ts.factory.createIfStatement(
      ts.factory.createFalse(), ts.factory.createBlock(propertyDecls, true));
  // Also add a comment above the block to exclude it from coverage.
  ts.addSyntheticLeadingComment(
      ifStmt, ts.SyntaxKind.MultiLineCommentTrivia, ' istanbul ignore if ',
      /* trailing newline */ true);
  return ifStmt;
}

function propertyName(prop: ts.NamedDeclaration): string|null {
  if (!prop.name) return null;

  switch (prop.name.kind) {
    case ts.SyntaxKind.Identifier:
      return transformerUtil.getIdentifierText(prop.name);
    case ts.SyntaxKind.StringLiteral:
      // E.g. interface Foo { 'bar': number; }
      // If 'bar' is a name that is not valid in Closure then there's nothing we can do.
      const text = prop.name.text;
      if (!isValidClosurePropertyName(text)) return null;
      return text;
    default:
      return null;
  }
}

/** Removes comment metacharacters from a string, to make it safe to embed in a comment. */
export function escapeForComment(str: string): string {
  return str.replace(/\/\*/g, '__').replace(/\*\//g, '__');
}

/**
 * A kind of property declaration that tsickle generates a Closure property
 * declaration for. Note that this includes ts.MethodDeclarations but only for
 * optional methods.
 */
type ClosureProperty = ts.PropertyDeclaration|ts.PropertySignature|
                       ts.ParameterDeclaration|ts.MethodDeclaration;

function createClosurePropertyDeclaration(
    mtt: ModuleTypeTranslator, expr: ts.Expression, prop: ClosureProperty,
    optional: boolean): ts.Statement {
  const name = propertyName(prop);
  if (!name) {
    // Skip warning for private identifiers because it is expected they are skipped in the
    // Closure output.
    // TODO(rdel): Once Closure Compiler determines how private properties should be represented,
    // adjust this output accordingly.
    if (ts.isPrivateIdentifier(prop.name)) {
      return transformerUtil.createMultiLineComment(
          prop, `Skipping private member:\n${escapeForComment(prop.getText())}`);
    } else {
      mtt.debugWarn(prop, `handle unnamed member:\n${escapeForComment(prop.getText())}`);
      return transformerUtil.createMultiLineComment(
          prop, `Skipping unnamed member:\n${escapeForComment(prop.getText())}`);
    }
  }

  if (name === 'prototype') {
    // Code that declares a property named 'prototype' typically is doing something
    // funny with the TS type system, and isn't actually interested in naming a
    // a field 'prototype', as prototype has special meaning in JS.
    return transformerUtil.createMultiLineComment(
        prop, `Skipping illegal member name:\n${escapeForComment(prop.getText())}`);
  }

  let type = mtt.typeToClosure(prop);
  // When a property is optional, e.g.
  //   foo?: string;
  // Then the TypeScript type of the property is string|undefined, the
  // typeToClosure translation handles it correctly, and string|undefined is
  // how you write an optional property in Closure.
  //
  // But in the special case of an optional property with type any:
  //   foo?: any;
  // The TypeScript type of the property is just "any" (because any includes
  // undefined as well) so our default translation of the type is just "?".
  // To mark the property as optional in Closure it must have "|undefined",
  // so the Closure type must be ?|undefined.
  if (optional && type === '?') type += '|undefined';

  // Don't report warnings here to avoid duplicate warnings. We already warn
  // once when visiting this ts.PropertyDeclaration in jsdocTransformer.visitor
  const tags: jsdoc.Tag[] = mtt.getJSDoc(prop, /* reportWarnings */ false);
  const flags = ts.getCombinedModifierFlags(prop);
  const isReadonly = !!(flags & ts.ModifierFlags.Readonly);
  tags.push({tagName: isReadonly ? 'const' : 'type', type});
  if (hasExportingDecorator(prop, mtt.typeChecker)) {
    tags.push({tagName: 'export'});
  } else if (flags & ts.ModifierFlags.Protected) {
    tags.push({tagName: 'protected'});
  } else if (flags & ts.ModifierFlags.Private) {
    tags.push({tagName: 'private'});
  } else if (!tags.find(
                 (t) => t.tagName === 'export' || t.tagName === 'package')) {
    // TODO(b/202495167): remove the 'package' check above.

    // TS members are implicitly public if no visibility modifier was specified.
    // In Closure Compiler, members might inherit their superclass' visiblity.
    // Always explicitly emitting the visibility makes sure there is no
    // disagreement.
    // However we may only do this if there is no @export modifier, as that also
    // counts as a visibility modifier in Closure Compiler.
    tags.push({tagName: 'public'});
  }

  const declStmt = ts.setSourceMapRange(
      ts.factory.createExpressionStatement(
          ts.factory.createPropertyAccessExpression(expr, name)),
      prop);
  // Avoid printing annotations that can conflict with @type
  // This avoids Closure's error "type annotation incompatible with other annotations"
  addCommentOn(declStmt, tags, jsdoc.TAGS_CONFLICTING_WITH_TYPE);
  return declStmt;
}

/**
 * Removes any type assertions and non-null expressions from the AST before TypeScript processing.
 *
 * Ideally, the code in jsdoc_transformer below should just remove the cast expression and
 * replace it with the Closure equivalent. However Angular's compiler is fragile to AST
 * nodes being removed or changing type, so the code must retain the type assertion
 * expression, see: https://github.com/angular/angular/issues/24895.
 *
 * tsickle also cannot just generate and keep a `(/.. @type {SomeType} ./ (expr as SomeType))`
 * because TypeScript removes the parenthesized expressions in that syntax, (reasonably) believing
 * they were only added for the TS cast.
 *
 * The final workaround is then to keep the TypeScript type assertions, and have a post-Angular
 * processing step that removes the assertions before TypeScript sees them.
 *
 * TODO(martinprobst): remove once the Angular issue is fixed.
 */
export function removeTypeAssertions(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      function visitor(node: ts.Node): ts.Node {
        switch (node.kind) {
          case ts.SyntaxKind.TypeAssertionExpression:
          case ts.SyntaxKind.AsExpression:
            return ts.visitNode((node as ts.AssertionExpression).expression, visitor);
          case ts.SyntaxKind.NonNullExpression:
            return ts.visitNode((node as ts.NonNullExpression).expression, visitor);
          default:
            break;
        }
        return ts.visitEachChild(node, visitor, context);
      }

      return visitor(sourceFile) as ts.SourceFile;
    };
  };
}

/**
 * Returns true if node lexically (recursively) contains an 'async' function.
 */
function containsAsync(node: ts.Node): boolean {
  if (ts.isFunctionLike(node) && transformerUtil.hasModifierFlag(node, ts.ModifierFlags.Async)) {
    return true;
  }
  return ts.forEachChild(node, containsAsync) || false;
}

/**
 * Determines if a given expression contains an optional property chain.
 */
function containsOptionalChainingOperator(node: ts.PropertyAccessExpression|ts.NonNullExpression|
                                          ts.CallExpression): boolean {
  let maybePropertyAccessChain: ts.Expression = node;
  // We know this is a property access chain if each member is a
  // PropertyAccessExpression`, a `NonNullExpression`, a `CallExpression`, or an
  // `ElementAccessExpression`. Once we get to an expression that isn't, we have
  // traversed the chain and can see if this was an optional chain.
  while (ts.isPropertyAccessExpression(maybePropertyAccessChain) ||
         ts.isNonNullExpression(maybePropertyAccessChain) ||
         ts.isCallExpression(maybePropertyAccessChain) ||
         ts.isElementAccessExpression(maybePropertyAccessChain)) {
    // If we're at an access that used `?.`, we have found an optional property chain.
    if (!ts.isNonNullExpression(maybePropertyAccessChain) &&
        maybePropertyAccessChain.questionDotToken != null) {
      return true;
    }

    maybePropertyAccessChain = maybePropertyAccessChain.expression;
  }

  return false;
}

/**
 * jsdocTransformer returns a transformer factory that converts TypeScript types into the equivalent
 * JSDoc annotations.
 */
export function jsdocTransformer(
    host: AnnotatorHost&GoogModuleProcessorHost, tsOptions: ts.CompilerOptions,
    typeChecker: ts.TypeChecker, diagnostics: ts.Diagnostic[]):
    (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sourceFile: ts.SourceFile) => {
      const moduleTypeTranslator = new ModuleTypeTranslator(
          sourceFile, typeChecker, host, diagnostics, /*isForExterns*/ false);
      /**
       * The set of all names exported from an export * in the current module. Used to prevent
       * emitting duplicated exports. The first export * takes precedence in ES6.
       */
      const expandedStarImports = new Set<string>();

      /**
       * While Closure compiler supports parameterized types, including parameterized `this` on
       * methods, it does not support constraints on them. That means that an `\@template`d type is
       * always considered to be `unknown` within the method, including `THIS`.
       *
       * To help Closure Compiler, we keep track of any templated this return type, and substitute
       * explicit casts to the templated type.
       *
       * This is an incomplete solution and works around a specific problem with warnings on unknown
       * this accesses. More generally, Closure also cannot infer constraints for any other
       * templated types, but that might require a more general solution in Closure Compiler.
       */
      let contextThisType: ts.Type|null = null;

      let emitNarrowedTypes = true;

      function visitClassDeclaration(classDecl: ts.ClassDeclaration): ts.Statement[] {
        const contextThisTypeBackup = contextThisType;

        const mjsdoc = moduleTypeTranslator.getMutableJSDoc(classDecl);
        if (transformerUtil.hasModifierFlag(classDecl, ts.ModifierFlags.Abstract)) {
          mjsdoc.tags.push({tagName: 'abstract'});
        }

        maybeAddTemplateClause(mjsdoc.tags, classDecl);
        if (!host.untyped) {
          maybeAddHeritageClauses(mjsdoc.tags, moduleTypeTranslator, classDecl);
        }
        mjsdoc.updateComment(jsdoc.TAGS_CONFLICTING_WITH_TYPE);
        const decls: ts.Statement[] = [];
        const memberDecl = createMemberTypeDeclaration(moduleTypeTranslator, classDecl);
        // WARNING: order is significant; we must create the member decl before transforming away
        // parameter property comments when visiting the constructor.
        decls.push(ts.visitEachChild(classDecl, visitor, context));
        if (memberDecl) decls.push(memberDecl);
        contextThisType = contextThisTypeBackup;
        return decls;
      }

      /**
       * visitHeritageClause works around a Closure Compiler issue, where the expression in an
       * "extends" clause must be a simple identifier, and in particular must not be a parenthesized
       * expression.
       *
       * This is triggered when TS code writes "class X extends (Foo as Bar) { ... }", commonly done
       * to support mixins. For extends clauses in classes, the code below drops the cast and any
       * parentheticals, leaving just the original expression.
       *
       * This is an incomplete workaround, as Closure will still bail on other super expressions,
       * but retains compatibility with the previous emit that (accidentally) dropped the cast
       * expression.
       *
       * TODO(martinprobst): remove this once the Closure side issue has been resolved.
       */
      function visitHeritageClause(heritageClause: ts.HeritageClause) {
        if (heritageClause.token !== ts.SyntaxKind.ExtendsKeyword || !heritageClause.parent ||
            heritageClause.parent.kind === ts.SyntaxKind.InterfaceDeclaration) {
          return ts.visitEachChild(heritageClause, visitor, context);
        }
        if (heritageClause.types.length !== 1) {
          moduleTypeTranslator.error(
              heritageClause, `expected exactly one type in class extension clause`);
        }
        const type = heritageClause.types[0];
        let expr: ts.Expression = type.expression;
        while (ts.isParenthesizedExpression(expr) || ts.isNonNullExpression(expr) ||
               ts.isAssertionExpression(expr)) {
          expr = expr.expression;
        }
        return ts.factory.updateHeritageClause(
            heritageClause, [ts.factory.updateExpressionWithTypeArguments(
                                type, expr, type.typeArguments || [])]);
      }

      function visitInterfaceDeclaration(iface: ts.InterfaceDeclaration): ts.Statement[] {
        const sym = typeChecker.getSymbolAtLocation(iface.name);
        if (!sym) {
          moduleTypeTranslator.error(iface, 'interface with no symbol');
          return [];
        }
        // If this symbol is both a type and a value, we cannot emit both into Closure's
        // single namespace, unless the interface is merged with a namespace.
        if (symbolIsValue(typeChecker, sym) && !isMergedDeclaration(iface)) {
          moduleTypeTranslator.debugWarn(
              iface, `type/symbol conflict for ${sym.name}, using {?} for now`);
          return [transformerUtil.createSingleLineComment(
              iface, 'WARNING: interface has both a type and a value, skipping emit')];
        }

        const tags = moduleTypeTranslator.getJSDoc(iface, /* reportWarnings */ true) || [];
        tags.push({tagName: 'record'});
        maybeAddTemplateClause(tags, iface);
        if (!host.untyped) {
          maybeAddHeritageClauses(tags, moduleTypeTranslator, iface);
        }
        const name = transformerUtil.getIdentifierText(iface.name);
        const modifiers =
            transformerUtil.hasModifierFlag(iface, ts.ModifierFlags.Export) ?
            [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)] :
            undefined;
        const decl = ts.setSourceMapRange(
            ts.factory.createFunctionDeclaration(
                modifiers,
                /* asterisk */ undefined,
                name,
                /* typeParameters */ undefined,
                /* parameters */[],
                /* type */ undefined,
                /* body */ ts.factory.createBlock([]),
                ),
            iface);
        addCommentOn(decl, tags, jsdoc.TAGS_CONFLICTING_WITH_TYPE);
        const isFirstOccurrence = getPreviousDeclaration(sym, iface) === null;
        const declarations: ts.Statement[] = [];
        if (isFirstOccurrence) declarations.push(decl);
        const memberDecl = createMemberTypeDeclaration(moduleTypeTranslator, iface);
        if (memberDecl) declarations.push(memberDecl);
        return declarations;
      }

      /** Function declarations are emitted as they are, with only JSDoc added. */
      function visitFunctionLikeDeclaration<T extends ts.FunctionLikeDeclaration>(fnDecl: T): T {
        if (!fnDecl.body) {
          // Two cases: abstract methods and overloaded methods/functions.
          // Abstract methods are handled in emitTypeAnnotationsHandler.
          // Overloads are union-ized into the shared type in FunctionType.
          return ts.visitEachChild(fnDecl, visitor, context);
        }
        const extraTags = [];
        if (hasExportingDecorator(fnDecl, typeChecker)) extraTags.push({tagName: 'export'});

        const {tags, thisReturnType} =
            moduleTypeTranslator.getFunctionTypeJSDoc([fnDecl], extraTags);

        // async functions when down-leveled access `this` to pass it to
        // tslib.__awaiter.  Closure wants to know the type of 'this' for that.
        // The type is known in many contexts (e.g. methods, arrow functions)
        // per the normal rules (e.g. looking at parent nodes and @this tags)
        // but if the search bottoms out at a function scope, then Closure
        // warns that 'this' is unknown.
        // Because we have already checked the type of 'this', we are ok to just
        // suppress in that case.  We do so by stuffing a @this on any function
        // where it might be needed; it's harmless to overapproximate.
        const isDownlevellingAsync =
            tsOptions.target !== undefined && tsOptions.target <= ts.ScriptTarget.ES2018;
        const isFunction = fnDecl.kind === ts.SyntaxKind.FunctionDeclaration;
        const hasExistingThisTag = tags.some(t => t.tagName === 'this');
        if (isDownlevellingAsync && isFunction && !hasExistingThisTag && containsAsync(fnDecl)) {
          tags.push({tagName: 'this', type: '*'});
        }
        const mjsdoc = moduleTypeTranslator.getMutableJSDoc(fnDecl);
        mjsdoc.tags = tags;
        mjsdoc.updateComment();

        const contextThisTypeBackup = contextThisType;
        // Arrow functions retain their context `this` type. All others reset the this type to
        // either none (if not specified) or the type given in a fn(this: T, ...) declaration.
        if (!ts.isArrowFunction(fnDecl)) contextThisType = thisReturnType;
        fnDecl = ts.visitEachChild(fnDecl, visitor, context);
        contextThisType = contextThisTypeBackup;

        if (!fnDecl.body) {
          // abstract functions do not need aliasing of their destructured
          // arguments.
          return fnDecl;
        }

        // Alias destructured function parameters for more precise types.

        const bindingAliases: Array<[ts.Identifier, ts.Identifier]> = [];
        const updatedParams = [];
        let hasUpdatedParams = false;
        for (const param of fnDecl.parameters) {
          if (!ts.isArrayBindingPattern(param.name)) {
            updatedParams.push(param);
            continue;
          }
          const updatedParamName =
              renameArrayBindings(param.name, bindingAliases);
          if (!updatedParamName) {
            updatedParams.push(param);
            continue;
          }
          hasUpdatedParams = true;
          updatedParams.push(ts.factory.updateParameterDeclaration(
              param, param.modifiers, param.dotDotDotToken, updatedParamName,
              param.questionToken, param.type, param.initializer));
        }

        if (!hasUpdatedParams || bindingAliases.length === 0) return fnDecl;

        let body = fnDecl.body;
        const stmts: ts.Statement[] =
            createArrayBindingAliases(ts.NodeFlags.Let, bindingAliases);
        if (!ts.isBlock(body)) {
          stmts.push(ts.factory.createReturnStatement(
              // Use ( parens ) to protect the return statement against
              // automatic semicolon insertion.
              ts.factory.createParenthesizedExpression(body)));
          body = ts.factory.createBlock(stmts, true);
        } else {
          stmts.push(...body.statements);
          body = ts.factory.updateBlock(body, stmts);
        }

        switch (fnDecl.kind) {
          case ts.SyntaxKind.FunctionDeclaration:
            fnDecl = ts.factory.updateFunctionDeclaration(
                         fnDecl, fnDecl.modifiers, fnDecl.asteriskToken,
                         fnDecl.name, fnDecl.typeParameters, updatedParams,
                         fnDecl.type, body) as T;
            break;
          case ts.SyntaxKind.MethodDeclaration:
            fnDecl =
                ts.factory.updateMethodDeclaration(
                    fnDecl, fnDecl.modifiers, fnDecl.asteriskToken, fnDecl.name,
                    fnDecl.questionToken, fnDecl.typeParameters, updatedParams,
                    fnDecl.type, body) as T;
            break;
          case ts.SyntaxKind.SetAccessor:
            fnDecl = ts.factory.updateSetAccessorDeclaration(
                         fnDecl, fnDecl.modifiers, fnDecl.name, updatedParams,
                         body) as T;
            break;
          case ts.SyntaxKind.Constructor:
            fnDecl = ts.factory.updateConstructorDeclaration(
                         fnDecl, fnDecl.modifiers, updatedParams, body) as T;
            break;
          case ts.SyntaxKind.FunctionExpression:
            fnDecl = ts.factory.updateFunctionExpression(
                         fnDecl, fnDecl.modifiers, fnDecl.asteriskToken,
                         fnDecl.name, fnDecl.typeParameters, updatedParams,
                         fnDecl.type, body) as T;
            break;
          case ts.SyntaxKind.ArrowFunction:
            fnDecl = ts.factory.updateArrowFunction(
                         fnDecl, fnDecl.modifiers, fnDecl.name, updatedParams,
                         fnDecl.type, fnDecl.equalsGreaterThanToken, body) as T;
            break;
          case ts.SyntaxKind.GetAccessor:
            moduleTypeTranslator.error(
                fnDecl, `get accessors cannot have parameters`);
            break;
          default:
            moduleTypeTranslator.error(
                fnDecl, `unexpected function like declaration`);
            break;
        }
        return fnDecl;
      }

      /**
       * In methods with a templated this type, adds explicit casts to accesses on this.
       *
       * @see contextThisType
       */
      function visitThisExpression(node: ts.ThisExpression) {
        if (!contextThisType) return ts.visitEachChild(node, visitor, context);
        return createClosureCast(node, node, contextThisType);
      }

      /**
       * visitVariableStatement flattens variable declaration lists (`var a, b;` to `var a; var
       * b;`), and attaches JSDoc comments to each variable. JSDoc comments preceding the
       * original variable are attached to the first newly created one.
       */
      function visitVariableStatement(varStmt: ts.VariableStatement): ts.Statement[] {
        const stmts: ts.Statement[] = [];

        // "const", "let", etc are stored in node flags on the declarationList.
        const flags = ts.getCombinedNodeFlags(varStmt.declarationList);

        let tags: jsdoc.Tag[]|null =
            moduleTypeTranslator.getJSDoc(varStmt, /* reportWarnings */ true);
        const leading = ts.getSyntheticLeadingComments(varStmt);
        if (leading) {
          // Attach non-JSDoc comments to a not emitted statement.
          const commentHolder = ts.factory.createNotEmittedStatement(varStmt);
          ts.setSyntheticLeadingComments(commentHolder, leading.filter(c => c.text[0] !== '*'));
          stmts.push(commentHolder);
        }

        for (const decl of varStmt.declarationList.declarations) {
          const localTags: jsdoc.Tag[] = [];
          if (tags) {
            // Add any tags and docs preceding the entire statement to the first variable.
            localTags.push(...tags);
            tags = null;
          }
          // Add an @type for plain identifiers, but not for bindings patterns (i.e. object or array
          // destructuring - those do not have a syntax in Closure) or @defines, which already
          // declare their type.
          if (ts.isIdentifier(decl.name)) {
            // For variables that are initialized and use a type marked as unknown, do not emit a
            // type at all. Closure Compiler might be able to infer a better type from the
            // initializer than the `?` the code below would emit.
            // TODO(martinprobst): consider doing this for all types that get emitted as ?, not just
            // for marked ones.
            const initializersMarkedAsUnknown =
                !!decl.initializer && moduleTypeTranslator.isAlwaysUnknownSymbol(decl);
            if (!initializersMarkedAsUnknown &&
                // No JSDoc needed for assigning a class expression to a var.
                decl.initializer?.kind !== ts.SyntaxKind.ClassExpression) {
              const typeStr = moduleTypeTranslator.typeToClosure(decl);
              // If @define is present then add the type to it, rather than adding a normal @type.
              const defineTag = localTags.find(({tagName}) => tagName === 'define');
              if (defineTag) {
                defineTag.type = typeStr;
              } else {
                localTags.push({tagName: 'type', type: typeStr});
              }
            }
          } else if (ts.isArrayBindingPattern(decl.name)) {
            const aliases: Array<[ts.Identifier, ts.Identifier]> = [];
            const updatedBinding = renameArrayBindings(decl.name, aliases);
            if (updatedBinding && aliases.length > 0) {
              const declVisited =
                  // TODO: go/ts50upgrade - Remove after upgrade.
                  // tslint:disable-next-line:no-unnecessary-type-assertion
                  ts.visitNode(decl, visitor, ts.isVariableDeclaration)!;
              const newDecl = ts.factory.updateVariableDeclaration(
                  declVisited, updatedBinding, declVisited.exclamationToken,
                  declVisited.type, declVisited.initializer);
              const newStmt = ts.factory.createVariableStatement(
                  varStmt.modifiers,
                  ts.factory.createVariableDeclarationList([newDecl], flags));
              if (localTags.length) {
                addCommentOn(
                    newStmt, localTags, jsdoc.TAGS_CONFLICTING_WITH_TYPE);
              }
              stmts.push(newStmt);
              stmts.push(...createArrayBindingAliases(
                  varStmt.declarationList.flags, aliases));
              continue;
            }
          }
          const newDecl =
              // TODO: go/ts50upgrade - Remove after upgrade.
              // tslint:disable-next-line:no-unnecessary-type-assertion
              ts.visitNode(decl, visitor, ts.isVariableDeclaration)!;
          const newStmt = ts.factory.createVariableStatement(
              varStmt.modifiers,
              ts.factory.createVariableDeclarationList([newDecl], flags));
          if (localTags.length) addCommentOn(newStmt, localTags, jsdoc.TAGS_CONFLICTING_WITH_TYPE);
          stmts.push(newStmt);
        }

        return stmts;
      }

      /**
       * shouldEmitExportsAssignments returns true if tsickle should emit `exports.Foo = ...` style
       * export statements.
       *
       * TypeScript modules can export types. Because types are pure design-time constructs in
       * TypeScript, it does not emit any actual exported symbols for these. But tsickle has to emit
       * an export, so that downstream Closure code (including tsickle-converted Closure code) can
       * import upstream types. tsickle has to pick a module format for that, because the pure ES6
       * export would get stripped by TypeScript.
       *
       * tsickle uses CommonJS to emit googmodule, and code not using googmodule doesn't care about
       * the Closure annotations anyway, so tsickle skips emitting exports if the module target
       * isn't commonjs.
       */
      function shouldEmitExportsAssignments() {
        return tsOptions.module === ts.ModuleKind.CommonJS;
      }

      function visitTypeAliasDeclaration(typeAlias: ts.TypeAliasDeclaration): ts.Statement[] {
        const sym = moduleTypeTranslator.mustGetSymbolAtLocation(typeAlias.name);
        // If the type is also defined as a value, skip emitting it. Closure collapses type & value
        // namespaces, the two emits would conflict if tsickle emitted both.
        if (symbolIsValue(typeChecker, sym)) return [];
        if (!shouldEmitExportsAssignments()) return [];

        const typeName = transformerUtil.getIdentifierText(typeAlias.name);

        // Set any type parameters as unknown, Closure does not support type aliases with type
        // parameters.
        moduleTypeTranslator.newTypeTranslator(typeAlias).markTypeParameterAsUnknown(
            moduleTypeTranslator.symbolsToAliasedNames, typeAlias.typeParameters);
        const typeStr =
            host.untyped ? '?' : moduleTypeTranslator.typeToClosure(typeAlias, undefined);

        // We want to emit a @typedef.  They are a bit weird because they are 'var' statements
        // that have no value.
        const tags = moduleTypeTranslator.getJSDoc(typeAlias, /* reportWarnings */ true);
        tags.push({tagName: 'typedef', type: typeStr});
        let propertyBase: string|null = null;
        if (transformerUtil.hasModifierFlag(
                typeAlias, ts.ModifierFlags.Export)) {
          // Given: export type T = ...;
          // We cannot emit `export var foo;` and let TS generate from there
          // because TypeScript drops exports that are never assigned values,
          // and Closure requires us to not assign values to typedef exports.
          // Introducing a new local variable and exporting it can cause bugs
          // due to name shadowing and confusing TypeScript's logic on what
          // symbols and types vs values are exported. Mangling the name to
          // avoid the conflicts would be reasonably clean, but would require
          // a two pass emit to first find all type alias names, mangle them,
          // and emit the use sites only later.
          // So we produce: exports.T;
          propertyBase = 'exports';
        }
        const ns = transformerUtil.getTransformedNs(typeAlias);
        if (ns !== null &&
            (ts.getOriginalNode(typeAlias).parent?.parent === ns) &&
            ts.isIdentifier(ns.name)) {
          // If the type alias T is defined at the top level of a transformed
          // merged namespace, generate the type alias as a propery of the
          // merged namespace: ns.T
          propertyBase = transformerUtil.getIdentifierText(ns.name);
        }
        let decl: ts.Statement;
        if (propertyBase !== null) {
          decl = ts.factory.createExpressionStatement(
              ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier(propertyBase),
                  ts.factory.createIdentifier(typeName)));
        } else {
          // Given: type T = ...;
          // We produce: var T;
          // Note: not const, because 'const Foo;' is illegal;
          // not let, because we want hoisting behavior for types.
          decl = ts.factory.createVariableStatement(
              /* modifiers */ undefined,
              ts.factory.createVariableDeclarationList(
                  [ts.factory.createVariableDeclaration(
                      ts.factory.createIdentifier(typeName))]));
        }
        decl = ts.setSourceMapRange(decl, typeAlias);
        addCommentOn(decl, tags, jsdoc.TAGS_CONFLICTING_WITH_TYPE);
        return [decl];
      }

      /** Emits a parenthesized Closure cast: `(/** \@type ... * / (expr))`. */
      function createClosureCast(context: ts.Node, expression: ts.Expression, type: ts.Type) {
        const inner = ts.factory.createParenthesizedExpression(expression);
        const comment = addCommentOn(
            inner, [{tagName: 'type', type: moduleTypeTranslator.typeToClosure(context, type)}]);
        comment.hasTrailingNewLine = false;
        return ts.setSourceMapRange(
            ts.factory.createParenthesizedExpression(inner), context);
      }

      /** Converts a TypeScript type assertion into a Closure Cast. */
      function visitAssertionExpression(assertion: ts.AssertionExpression) {
        const type = typeChecker.getTypeAtLocation(assertion.type);
        return createClosureCast(assertion, ts.visitEachChild(assertion, visitor, context), type);
      }

      /**
       * Converts a TypeScript non-null assertion into a Closure Cast, by stripping |null and
       * |undefined from a union type.
       */
      function visitNonNullExpression(nonNull: ts.NonNullExpression) {
        // If this is a NonNullExpression inside of a property chain with a `?.`
        // access we cannot add a cast telling Closure Compiler that this node
        // is non-nullable. Adding that cast requires additional parentheses,
        // which changes the behavior of the optional chain. Instead, we drop
        // the `!` and return the inner expression as-is. This works in the
        // context of chained property access because JSCompiler will not check
        // this. If this non-null expression is part of a property access chain
        // but comes before the ?. access (for example a!.b?.c)
        // `containsOptionalChainingOperator` will return false, but in that
        // situation we can safely add the cast because extra parens only matter
        // after the ?. access.
        if (containsOptionalChainingOperator(nonNull)) {
          return nonNull.expression;
        }

        const type = typeChecker.getTypeAtLocation(nonNull.expression);
        const nonNullType = typeChecker.getNonNullableType(type);
        return createClosureCast(
            nonNull, ts.visitEachChild(nonNull, visitor, context), nonNullType);
      }

      function getNarrowedType(node: ts.Expression): ts.Type|undefined {
        // Don't support narrowing of `this`, `super` and module/class/interface
        // declarations. JSCompiler doesn't support casts in all locations and
        // they are rarely used in type guards in practice.
        if (node.kind === ts.SyntaxKind.SuperKeyword) return undefined;
        if (node.kind === ts.SyntaxKind.ThisKeyword) return undefined;

        const symbol = typeChecker.getSymbolAtLocation(node);
        if (symbol?.declarations === undefined ||
            symbol.declarations.length === 0 ||
            symbol.declarations.some(
                (decl) => ts.isClassDeclaration(decl) ||
                    ts.isInterfaceDeclaration(decl) ||
                    ts.isModuleDeclaration(decl))) {
          return undefined;
        }

        const typeAtUsage = typeChecker.getTypeAtLocation(node);
        const notNullableType = typeChecker.getNonNullableType(typeAtUsage);

        for (const decl of symbol.declarations) {
          const declaredType =
              typeChecker.getTypeOfSymbolAtLocation(symbol, decl);
          if (typeAtUsage !== declaredType &&
              notNullableType !==
                  typeChecker.getNonNullableType(declaredType) &&
              moduleTypeTranslator.typeToClosure(node, typeAtUsage) !== '?') {
            return typeAtUsage;
          }
        }
        return undefined;
      }

      function visitPropertyAccessExpression(
          node: ts.PropertyAccessExpression) {
        // Do not emit narrowing casts if it's disabled in current context (e.g.
        // in deletion expressions) or if the node contains `?.` (see comment in
        // visitNonNullExpression() why we can't emit casts there).
        if (!emitNarrowedTypes || containsOptionalChainingOperator(node)) {
          return ts.visitEachChild(node, visitor, context);
        }
        // In case the types were narrowed since declaration, pass additional
        // types information to JSCompiler.
        //
        // Types narrowing works both on objects and their properties. We always
        // try to emit the cast for objects (`node.expression`). If it
        // succeeds, then type narrowing information about the property
        // JSCompiler might had gets lost, so we may have to emit another cast
        // for the property (`node`).
        const objType = getNarrowedType(node.expression);
        if (objType === undefined) {
          return ts.visitEachChild(node, visitor, context);
        }
        const propertyAccessWithCast =
            ts.factory.updatePropertyAccessExpression(
                node,
                createClosureCast(
                    node.expression,
                    ts.visitEachChild(node.expression, visitor, context),
                    objType),
                node.name);

        const propType = getNarrowedType(node);
        if (propType === undefined) {
          return propertyAccessWithCast;
        }
        return createClosureCast(node, propertyAccessWithCast, propType);
      }

      function visitImportDeclaration(importDecl: ts.ImportDeclaration) {
        // For each import, insert a goog.requireType for the module, so that if
        // TypeScript does not emit the module because it's only used in type
        // positions, the JSDoc comments still reference a valid Closure level
        // symbol.

        // No need to requireType side effect imports.
        // Note that this means tsickle does not report diagnostics for
        // side-effect path imports of JavaScript modules with conflicting
        // provides. That is working as intended.
        if (!importDecl.importClause) return importDecl;

        const sym = typeChecker.getSymbolAtLocation(importDecl.moduleSpecifier);
        // Scripts do not have a symbol, and neither do unused modules (empty
        // import list). Scripts can still be imported using side effect
        // imports. TypeScript emits a runtime load for a side-effect imports,
        // which has the desired effect of executing side-effects, and can also
        // be used to make sure global declarations are present. Neither of
        // these need a `goog.requireType`.
        // Empty import lists (`import {} from 'x';`) intentionally create no
        // emit in TS and do not need a `goog.requireType` either (as there is
        // no symbol imported). Users that wish to force a load should use
        // side-effect imports.
        if (!sym) return importDecl;

        const importPath =
            (importDecl.moduleSpecifier as ts.StringLiteral).text;

        moduleTypeTranslator.requireType(
            importDecl.moduleSpecifier, importPath, sym,
            /* default import? */ !!importDecl.importClause.name);
        return importDecl;
      }

      /**
       * Parses and then re-serializes JSDoc comments, escaping or removing
       * illegal tags.
       *
       * Closure Compiler will fail when it finds incorrect JSDoc tags on
       * nodes. This function also escapes some type-syntax tags used by
       * JSCompiler, in case they would end up in incorrect places after
       * transformation.
       */
      function escapeIllegalJSDoc(node: ts.Node) {
        if (!ts.getParseTreeNode(node)) return;
        // TODO(b/139687753): support escaping multiple pieces of JSDoc attached
        // to a single ts.Node instead of just the last JSDoc or ban them
        const mjsdoc = moduleTypeTranslator.getMutableJSDoc(node);
        mjsdoc.updateComment(jsdoc.TAGS_CONFLICTING_WITH_TYPE);
      }

      /** Returns true if a value export should be emitted for the given symbol in export *. */
      function shouldEmitValueExportForSymbol(sym: ts.Symbol): boolean {
        if (sym.flags & ts.SymbolFlags.Alias) {
          sym = typeChecker.getAliasedSymbol(sym);
        }
        if ((sym.flags & ts.SymbolFlags.Value) === 0) {
          // Note: We create explicit exports of type symbols for closure in visitExportDeclaration.
          return false;
        }
        if (!tsOptions.preserveConstEnums && sym.flags & ts.SymbolFlags.ConstEnum) {
          return false;
        }
        return true;
      }

      /**
       * visitExportDeclaration requireTypes exported modules and emits explicit exports for
       * types (which normally do not get emitted by TypeScript).
       */
      function visitExportDeclaration(exportDecl: ts.ExportDeclaration): ts.Node|ts.Node[] {
        const importedModuleSymbol = exportDecl.moduleSpecifier &&
            typeChecker.getSymbolAtLocation(exportDecl.moduleSpecifier)!;
        if (importedModuleSymbol) {
          // requireType all explicitly imported modules, so that symbols can be referenced and
          // type only modules are usable from type declarations.
          moduleTypeTranslator.requireType(
              exportDecl.moduleSpecifier!, (exportDecl.moduleSpecifier as ts.StringLiteral).text,
              importedModuleSymbol,
              /* default import? */ false);
        }

        const typesToExport: Array<[string, ts.Symbol]> = [];
        if (!exportDecl.exportClause) {
          // export * from '...'
          // Resolve the * into all value symbols exported, and update the export declaration.

          // Explicitly spelled out exports (i.e. the exports of the current module) take precedence
          // over implicit ones from export *. Use the current module's exports to filter.
          const currentModuleSymbol = typeChecker.getSymbolAtLocation(sourceFile);
          const currentModuleExports = currentModuleSymbol && currentModuleSymbol.exports;

          if (!importedModuleSymbol) {
            moduleTypeTranslator.error(exportDecl, `export * without module symbol`);
            return exportDecl;
          }
          const exportedSymbols = typeChecker.getExportsOfModule(importedModuleSymbol);
          const exportSpecifiers: ts.ExportSpecifier[] = [];
          for (const sym of exportedSymbols) {
            if (currentModuleExports && currentModuleExports.has(sym.escapedName)) continue;
            // We might have already generated an export for the given symbol.
            if (expandedStarImports.has(sym.name)) continue;
            expandedStarImports.add(sym.name);
            // Only create an export specifier for values that are exported. For types, the code
            // below creates specific export statements that match Closure's expectations.
            if (shouldEmitValueExportForSymbol(sym)) {
              exportSpecifiers.push(ts.factory.createExportSpecifier(
                  /* isTypeOnly */ false, undefined, sym.name));
            } else {
              typesToExport.push([sym.name, sym]);
            }
          }
          const isTypeOnlyExport = false;
          exportDecl = ts.factory.updateExportDeclaration(
              exportDecl, exportDecl.modifiers, isTypeOnlyExport,
              ts.factory.createNamedExports(exportSpecifiers),
              exportDecl.moduleSpecifier, exportDecl.assertClause);
        } else if (ts.isNamedExports(exportDecl.exportClause)) {
          // export {a, b, c} from 'abc';
          for (const exp of exportDecl.exportClause.elements) {
            const exportedName = transformerUtil.getIdentifierText(exp.name);
            typesToExport.push(
                [exportedName, moduleTypeTranslator.mustGetSymbolAtLocation(exp.name)]);
          }
        }
        // Do not emit typedef re-exports in untyped mode.
        if (host.untyped) return exportDecl;

        const result: ts.Node[] = [exportDecl];
        for (const [exportedName, sym] of typesToExport) {
          let aliasedSymbol = sym;
          if (sym.flags & ts.SymbolFlags.Alias) {
            aliasedSymbol = typeChecker.getAliasedSymbol(sym);
          }
          const isTypeAlias = (aliasedSymbol.flags & ts.SymbolFlags.Value) === 0 &&
              (aliasedSymbol.flags & (ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Interface)) !== 0;
          if (!isTypeAlias) continue;
          const typeName =
              moduleTypeTranslator.symbolsToAliasedNames.get(aliasedSymbol) || aliasedSymbol.name;
          const stmt = ts.factory.createExpressionStatement(
              ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier('exports'), exportedName));
          addCommentOn(stmt, [{tagName: 'typedef', type: '!' + typeName}]);
          ts.addSyntheticTrailingComment(
              stmt, ts.SyntaxKind.SingleLineCommentTrivia, ' re-export typedef', true);
          result.push(stmt);
        }
        return result;
      }

      /**
       * Returns the identifiers exported in a single exported statement - typically just one
       * identifier (e.g. for `export function foo()`), but multiple for `export declare var a, b`.
       */
      function getExportDeclarationNames(node: ts.Node): ts.Identifier[] {
        switch (node.kind) {
          case ts.SyntaxKind.VariableStatement:
            const varDecl = node as ts.VariableStatement;
            return varDecl.declarationList.declarations.map((d) => getExportDeclarationNames(d)[0]);
          case ts.SyntaxKind.VariableDeclaration:
          case ts.SyntaxKind.FunctionDeclaration:
          case ts.SyntaxKind.InterfaceDeclaration:
          case ts.SyntaxKind.ClassDeclaration:
          case ts.SyntaxKind.ModuleDeclaration:
          case ts.SyntaxKind.EnumDeclaration:
            const decl = node as ts.NamedDeclaration;
            if (!decl.name || decl.name.kind !== ts.SyntaxKind.Identifier) {
              break;
            }
            return [decl.name];
          case ts.SyntaxKind.TypeAliasDeclaration:
            const typeAlias = node as ts.TypeAliasDeclaration;
            return [typeAlias.name];
          default:
            break;
        }
        moduleTypeTranslator.error(
            node, `unsupported export declaration ${ts.SyntaxKind[node.kind]}: ${node.getText()}`);
        return [];
      }

      /**
       * Ambient declarations declare types for TypeScript's benefit, and will be removed by
       * TypeScript during its emit phase. Downstream Closure code however might be importing
       * symbols from this module, so tsickle must emit a Closure-compatible exports declaration.
       */
      function visitExportedAmbient(node: ts.Node): ts.Node[] {
        if (host.untyped || !shouldEmitExportsAssignments()) return [node];

        const declNames = getExportDeclarationNames(node);
        const result: ts.Node[] = [node];
        for (const decl of declNames) {
          const sym = typeChecker.getSymbolAtLocation(decl)!;
          // Non-value objects do not exist at runtime, so we cannot access the symbol (it only
          // exists in externs). Export them as a typedef, which forwards to the type in externs.
          // Note: TypeScript emits odd code for exported ambients (exports.x for variables, just x
          // for everything else). That seems buggy, and in either case this code should not attempt
          // to fix it.
          // See also https://github.com/Microsoft/TypeScript/issues/8015.
          if (!symbolIsValue(typeChecker, sym)) {
            // Do not emit re-exports for ModuleDeclarations.
            // Ambient ModuleDeclarations are always referenced as global symbols, so they don't
            // need to be exported.
            if (node.kind === ts.SyntaxKind.ModuleDeclaration) continue;
            const mangledName = moduleNameAsIdentifier(host, sourceFile.fileName);
            const declName = transformerUtil.getIdentifierText(decl);
            const stmt = ts.factory.createExpressionStatement(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier('exports'), declName));
            addCommentOn(stmt, [{tagName: 'typedef', type: `!${mangledName}.${declName}`}]);
            result.push(stmt);
          }
        }
        return result;
      }

      /**
       * Visits enum declarations to check for validity of JSDoc comments without transforming the
       * node at all.
       */
      function visitEnumDeclaration(node: ts.EnumDeclaration) {
        // Calling `getJSDoc` will validate and report any errors, but this code
        // doesn't really care about the return value.
        moduleTypeTranslator.getJSDoc(node, /* reportWarnings */ true);
      }

      /**
       * Counter to generate (reasonably) unique alias names for array
       * rebindings.
       */
      let aliasCounter = 1;

      /**
       * renameArrayBindings renames each destructured array binding identifier
       * and returns a list of the generated aliases. It operates recursively,
       * but does not support nested object patterns.
       */
      function renameArrayBindings(
          node: ts.ArrayBindingPattern,
          aliases: Array<[ts.Identifier, ts.Identifier]>):
          ts.ArrayBindingPattern|undefined {
        const updatedElements: ts.ArrayBindingElement[] = [];
        for (const e of node.elements) {
          if (ts.isOmittedExpression(e)) {
            updatedElements.push(e);
            continue;
          } else if (ts.isObjectBindingPattern(e.name)) {
            return undefined;  // object binding patterns are unsupported
          }
          let updatedBindingName;
          if (ts.isArrayBindingPattern(e.name)) {
            updatedBindingName = renameArrayBindings(e.name, aliases);
            // If the nested binding wasn't handled, we cannot handle the parent
            // case either.
            if (!updatedBindingName) return undefined;
          } else {
            // Plain identifier.
            const aliasName = ts.factory.createIdentifier(
                `${e.name.text}__tsickle_destructured_${aliasCounter++}`);
            aliases.push([e.name, aliasName]);
            updatedBindingName = aliasName;
          }
          updatedElements.push(ts.factory.updateBindingElement(
              e, e.dotDotDotToken,
              ts.visitNode(e.propertyName, visitor, ts.isPropertyName),
              updatedBindingName,
              // TODO: go/ts50upgrade - Remove after upgrade.
              // tslint:disable-next-line:no-unnecessary-type-assertion
              ts.visitNode(e.initializer, visitor) as ts.Expression));
        }
        return ts.factory.updateArrayBindingPattern(node, updatedElements);
      }

      /**
       * For each alias created, insert a "const oldName = aliasName;",
       * with an appropriate JSDoc comment.
       * @param flags The node.flags to use for the variable declaration. This
       *     controls const/let/var in particular.
       */
      function createArrayBindingAliases(
          flags: ts.NodeFlags,
          aliases: Array<[ts.Identifier, ts.Identifier]>): ts.Statement[] {
        const aliasDecls: ts.Statement[] = [];
        for (const [oldName, aliasName] of aliases) {
          const typeStr =
              moduleTypeTranslator.typeToClosure(ts.getOriginalNode(oldName));
          const closureCastExpr =
              ts.factory.createParenthesizedExpression(aliasName);
          addCommentOn(
              closureCastExpr, [{tagName: 'type', type: typeStr}],
              /* escape tags */ undefined,
              /* hasTrailingNewLine */ false);
          const varDeclList = ts.factory.createVariableDeclarationList(
              [ts.factory.createVariableDeclaration(
                  oldName, /* exclamationToken? */ undefined,
                  /* type? */ undefined, closureCastExpr)],
              flags);
          const varStmt = ts.factory.createVariableStatement(
              /*modifiers*/ undefined, varDeclList);
          aliasDecls.push(varStmt);
        }
        return aliasDecls;
      }

      /**
       * Special cases the common idiom:
       *   for (const [a, b] of x) { ... }
       *
       * Closure Compiler does not support tuple types, so a and b end up being
       * a union type. Using the union type can then lead to type mismatches,
       * which can lead to deoptimizations.
       *
       * To work around, this code renames the binding elements and creates
       * explicit casts and assignments to the previous names, giving symbols to
       * Closure Compiler that have the right type. E.g. like so:
       *
       *   for (const [a_1, b_1] of x) {
       *     const a = /.. .type {string} ./ (a_1);
       *     ...
       *   }
       */
      function visitForOfStatement(node: ts.ForOfStatement): ts.ForOfStatement {
        const varDecls = node.initializer;
        if (!ts.isVariableDeclarationList(varDecls)) {
          return ts.visitEachChild(node, visitor, context);
        }
        if (varDecls.declarations.length !== 1) {
          return ts.visitEachChild(node, visitor, context);
        }
        const varDecl = varDecls.declarations[0];
        if (!ts.isArrayBindingPattern(varDecl.name)) {
          return ts.visitEachChild(node, visitor, context);
        }

        const aliases: Array<[ts.Identifier, ts.Identifier]> = [];
        const updatedPattern = renameArrayBindings(varDecl.name, aliases);
        if (!updatedPattern || aliases.length === 0) {
          return ts.visitEachChild(node, visitor, context);
        }

        const updatedInitializer = ts.factory.updateVariableDeclarationList(
            varDecls, [ts.factory.updateVariableDeclaration(
                          varDecl, updatedPattern, varDecl.exclamationToken,
                          varDecl.type, varDecl.initializer)]);
        const aliasDecls = createArrayBindingAliases(varDecls.flags, aliases);
        // Convert the for/of body into a block, if needed.
        let updatedStatement;
        if (ts.isBlock(node.statement)) {
          updatedStatement = ts.factory.updateBlock(node.statement, [
            ...aliasDecls,
            // TODO: go/ts50upgrade - Remove after upgrade.
            // tslint:disable-next-line:no-unnecessary-type-assertion
            ...ts.visitNode(node.statement, visitor, ts.isBlock)!.statements
          ]);
        } else {
          updatedStatement = ts.factory.createBlock([
            ...aliasDecls,
            // TODO: go/ts50upgrade - Remove after upgrade.
            // tslint:disable-next-line:no-unnecessary-type-assertion
            ts.visitNode(node.statement, visitor) as ts.Statement
          ]);
        }
        return ts.factory.updateForOfStatement(
            node, node.awaitModifier, updatedInitializer,
            // TODO: go/ts50upgrade - Remove after upgrade.
            // tslint:disable-next-line:no-unnecessary-type-assertion
            ts.visitNode(node.expression, visitor) as ts.Expression,
            updatedStatement);
      }

      function visitor(node: ts.Node): ts.Node|ts.Node[] {
        if (transformerUtil.isAmbient(node)) {
          if (!transformerUtil.hasModifierFlag(node as ts.Declaration, ts.ModifierFlags.Export)) {
            return node;
          }
          return visitExportedAmbient(node);
        }
        switch (node.kind) {
          case ts.SyntaxKind.ImportDeclaration:
            return visitImportDeclaration(node as ts.ImportDeclaration);
          case ts.SyntaxKind.ExportDeclaration:
            return visitExportDeclaration(node as ts.ExportDeclaration);
          case ts.SyntaxKind.ClassDeclaration:
            return visitClassDeclaration(node as ts.ClassDeclaration);
          case ts.SyntaxKind.InterfaceDeclaration:
            return visitInterfaceDeclaration(node as ts.InterfaceDeclaration);
          case ts.SyntaxKind.HeritageClause:
            return visitHeritageClause(node as ts.HeritageClause);
          case ts.SyntaxKind.ArrowFunction:
          case ts.SyntaxKind.FunctionExpression:
            // Inserting a comment before an expression can trigger automatic semicolon insertion,
            // e.g. if the function below is the expression in a `return` statement. Parenthesizing
            // prevents ASI, as long as the opening paren remains on the same line (which it does).
            return ts.factory.createParenthesizedExpression(
                visitFunctionLikeDeclaration(
                    node as ts.ArrowFunction | ts.FunctionExpression));
          case ts.SyntaxKind.Constructor:
          case ts.SyntaxKind.FunctionDeclaration:
          case ts.SyntaxKind.MethodDeclaration:
          case ts.SyntaxKind.GetAccessor:
          case ts.SyntaxKind.SetAccessor:
            return visitFunctionLikeDeclaration(node as ts.FunctionLikeDeclaration);
          case ts.SyntaxKind.ThisKeyword:
            return visitThisExpression(node as ts.ThisExpression);
          case ts.SyntaxKind.VariableStatement:
            return visitVariableStatement(node as ts.VariableStatement);
          case ts.SyntaxKind.ExpressionStatement:
          case ts.SyntaxKind.PropertyAssignment:
          case ts.SyntaxKind.PropertyDeclaration:
          case ts.SyntaxKind.ModuleDeclaration:
          case ts.SyntaxKind.EnumMember:
            escapeIllegalJSDoc(node);
            break;
          case ts.SyntaxKind.Parameter:
            // Parameter properties (e.g. `constructor(/** docs */ private foo: string)`) might have
            // JSDoc comments, including JSDoc tags recognized by Closure Compiler. Prevent emitting
            // any comments on them, so that Closure doesn't error on them.
            // See test_files/parameter_properties.ts.
            const paramDecl = node as ts.ParameterDeclaration;
            if (transformerUtil.hasModifierFlag(
                    paramDecl, ts.ModifierFlags.ParameterPropertyModifier)) {
              ts.setSyntheticLeadingComments(paramDecl, []);
              jsdoc.suppressLeadingCommentsRecursively(paramDecl);
            }
            break;
          case ts.SyntaxKind.TypeAliasDeclaration:
            return visitTypeAliasDeclaration(node as ts.TypeAliasDeclaration);
          case ts.SyntaxKind.AsExpression:
          case ts.SyntaxKind.TypeAssertionExpression:
            return visitAssertionExpression(node as ts.TypeAssertion);
          case ts.SyntaxKind.NonNullExpression:
            return visitNonNullExpression(node as ts.NonNullExpression);
          case ts.SyntaxKind.PropertyAccessExpression:
            return visitPropertyAccessExpression(
                node as ts.PropertyAccessExpression);
          case ts.SyntaxKind.EnumDeclaration:
            visitEnumDeclaration(node as ts.EnumDeclaration);
            break;
          case ts.SyntaxKind.ForOfStatement:
            return visitForOfStatement(node as ts.ForOfStatement);
          case ts.SyntaxKind.DeleteExpression:
            // Do not emit narrowing casts in delete expressions as this syntax
            // is not supported by JSCompiler parser.
            emitNarrowedTypes = false;
            const visited = ts.visitEachChild(node, visitor, context);
            emitNarrowedTypes = true;
            return visited;
          default:
            break;
        }
        return ts.visitEachChild(node, visitor, context);
      }

      sourceFile = ts.visitEachChild(sourceFile, visitor, context);

      return moduleTypeTranslator.insertAdditionalImports(sourceFile);
    };
  };
}
