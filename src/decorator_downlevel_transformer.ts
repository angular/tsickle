/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview Decorator downleveling support. tsickle can optionally convert decorator calls
 * into annotations. For example, a decorator application on a method:
 *   class X {
 *     @Foo(1, 2)
 *     bar() { ... }
 *   }
 * Will get converted to:
 *   class X {
 *     bar() { ... }
 *     static propDecorators = {
 *       bar: {type: Foo, args: [1, 2]}
 *     }
 *   }
 * Similarly for decorators on the class (property 'decorators') and decorators on the constructor
 * (property 'ctorParameters', including the types of all arguments of the constructor).
 *
 * This is used by, among other software, Angular in its "non-AoT" mode to inspect decorator
 * invocations.
 */

import * as ts from 'typescript';

import {getDecoratorDeclarations} from './decorators';
import {getAllLeadingComments, symbolIsValue, visitEachChild} from './transformer_util';

/**
 * Returns true if the given decorator should be downleveled.
 *
 * Decorators that have JSDoc on them including the `@Annotation` tag are downleveled and converted
 * into properties on the class by this pass.
 */
export function shouldLower(decorator: ts.Decorator, typeChecker: ts.TypeChecker) {
  for (const d of getDecoratorDeclarations(decorator, typeChecker)) {
    // TODO(lucassloan):
    // Switch to the TS JSDoc parser in the future to avoid false positives here.
    // For example using '@Annotation' in a true comment.
    // However, a new TS API would be needed, track at
    // https://github.com/Microsoft/TypeScript/issues/7393.
    let commentNode: ts.Node = d;
    // Not handling PropertyAccess expressions here, because they are
    // filtered earlier.
    if (commentNode.kind === ts.SyntaxKind.VariableDeclaration) {
      if (!commentNode.parent) continue;
      commentNode = commentNode.parent;
    }
    // Go up one more level to VariableDeclarationStatement, where usually
    // the comment lives. If the declaration has an 'export', the
    // VDList.getFullText will not contain the comment.
    if (commentNode.kind === ts.SyntaxKind.VariableDeclarationList) {
      if (!commentNode.parent) continue;
      commentNode = commentNode.parent;
    }
    const range = getAllLeadingComments(commentNode);
    if (!range) continue;
    for (const {text} of range) {
      if (text.includes('@Annotation')) return true;
    }
  }
  return false;
}

/**
 * Creates the AST for the decorator field type annotation, which has the form
 *     { type: Function, args?: any[] }[]
 */
function createDecoratorInvocationType(): ts.TypeNode {
  const typeElements: ts.TypeElement[] = [];
  typeElements.push(ts.createPropertySignature(
      undefined, 'type', undefined,
      ts.createTypeReferenceNode(ts.createIdentifier('Function'), undefined), undefined));
  typeElements.push(ts.createPropertySignature(
      undefined, 'args', ts.createToken(ts.SyntaxKind.QuestionToken),
      ts.createArrayTypeNode(ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)), undefined));
  return ts.createArrayTypeNode(ts.createTypeLiteralNode(typeElements));
}

/**
 * Extracts the type of the decorator (the function or expression invoked), as well as all the
 * arguments passed to the decorator. Returns an AST with the form:
 *
 *     // For @decorator(arg1, arg2)
 *     { type: decorator, args: [arg1, arg2] }
 */
function extractMetadataFromSingleDecorator(
    decorator: ts.Decorator, diagnostics: ts.Diagnostic[]): ts.ObjectLiteralExpression {
  const metadataProperties: ts.ObjectLiteralElementLike[] = [];
  const expr = decorator.expression;
  switch (expr.kind) {
    case ts.SyntaxKind.Identifier:
      // The decorator was a plain @Foo.
      metadataProperties.push(ts.createPropertyAssignment('type', expr));
      break;
    case ts.SyntaxKind.CallExpression:
      // The decorator was a call, like @Foo(bar).
      const call = expr as ts.CallExpression;
      metadataProperties.push(ts.createPropertyAssignment('type', call.expression));
      if (call.arguments.length) {
        const args: ts.Expression[] = [];
        for (const arg of call.arguments) {
          args.push(arg);
        }
        const argsArrayLiteral = ts.createArrayLiteral(args);
        argsArrayLiteral.elements.hasTrailingComma = true;
        metadataProperties.push(ts.createPropertyAssignment('args', argsArrayLiteral));
      }
      break;
    default:
      diagnostics.push({
        file: decorator.getSourceFile(),
        start: decorator.getStart(),
        length: decorator.getEnd() - decorator.getStart(),
        messageText:
            `${ts.SyntaxKind[decorator.kind]} not implemented in gathering decorator metadata`,
        category: ts.DiagnosticCategory.Error,
        code: 0,
      });
      break;
  }
  return ts.createObjectLiteral(metadataProperties);
}

/**
 * Takes a list of decorator metadata object ASTs and produces an AST for a
 * static class property of an array of those metadata objects.
 */
function createDecoratorClassProperty(decoratorList: ts.ObjectLiteralExpression[]) {
  const modifier = ts.createToken(ts.SyntaxKind.StaticKeyword);
  const type = createDecoratorInvocationType();
  const initializer = ts.createArrayLiteral(decoratorList, true);
  initializer.elements.hasTrailingComma = true;
  const prop = ts.createProperty(undefined, [modifier], 'decorators', undefined, type, initializer);
  // NB: the .decorators property does not get a @nocollapse property. There is
  // no good reason why - it means .decorators is not runtime accessible if you
  // compile with collapse properties, whereas propDecorators is, which doesn't
  // follow any stringent logic. However this has been the case previously, and
  // adding it back in leads to substantial code size increases as Closure fails
  // to tree shake these props without @nocollapse.
  return prop;
}

/**
 * Creates the AST for the 'ctorParameters' field type annotation:
 *   () => ({ type: any, decorators?: {type: Function, args?: any[]}[] }|null)[]
 */
function createCtorParametersClassPropertyType(): ts.TypeNode {
  // Sorry about this. Try reading just the string literals below.
  const typeElements: ts.TypeElement[] = [];
  typeElements.push(ts.createPropertySignature(
      undefined, 'type', undefined,
      ts.createTypeReferenceNode(ts.createIdentifier('any'), undefined), undefined));
  typeElements.push(ts.createPropertySignature(
      undefined, 'decorators', ts.createToken(ts.SyntaxKind.QuestionToken),
      ts.createArrayTypeNode(ts.createTypeLiteralNode([
        ts.createPropertySignature(
            undefined, 'type', undefined,
            ts.createTypeReferenceNode(ts.createIdentifier('Function'), undefined), undefined),
        ts.createPropertySignature(
            undefined, 'args', ts.createToken(ts.SyntaxKind.QuestionToken),
            ts.createArrayTypeNode(
                ts.createTypeReferenceNode(ts.createIdentifier('any'), undefined)),
            undefined),
      ])),
      undefined));
  return ts.createFunctionTypeNode(undefined, [], ts.createArrayTypeNode(ts.createUnionTypeNode([
    ts.createTypeLiteralNode(typeElements), ts.factory.createTypeReferenceNode('null')
  ])));
}

/**
 * Sets a Closure \@nocollapse synthetic comment on the given node. This prevents Closure Compiler
 * from collapsing the apparently static property, which would make it impossible to find for code
 * trying to detect it at runtime.
 */
function addNoCollapseComment(n: ts.Node) {
  ts.setSyntheticLeadingComments(n, [{
                                   kind: ts.SyntaxKind.MultiLineCommentTrivia,
                                   text: '* @nocollapse ',
                                   pos: -1,
                                   end: -1,
                                   hasTrailingNewLine: true
                                 }]);
}

/**
 * createCtorParametersClassProperty creates a static 'ctorParameters' property containing
 * downleveled decorator information.
 *
 * The property contains an arrow function that returns an array of object literals of the shape:
 *     static ctorParameters = () => [{
 *       type: SomeClass|undefined,  // the type of the param that's decorated, if it's a value.
 *       decorators: [{
 *         type: DecoratorFn,  // the type of the decorator that's invoked.
 *         args: [ARGS],       // the arguments passed to the decorator.
 *       }]
 *     }];
 */
function createCtorParametersClassProperty(
    diagnostics: ts.Diagnostic[],
    entityNameToExpression: (n: ts.EntityName) => ts.Expression | undefined,

    ctorParameters: ParameterDecorationInfo[]): ts.PropertyDeclaration {
  const params: ts.Expression[] = [];

  for (const ctorParam of ctorParameters) {
    if (!ctorParam.type && ctorParam.decorators.length === 0) {
      params.push(ts.createNull());
      continue;
    }

    const paramType = ctorParam.type ?
        typeReferenceToExpression(entityNameToExpression, ctorParam.type) :
        undefined;
    const members =
        [ts.createPropertyAssignment('type', paramType || ts.createIdentifier('undefined'))];

    const decorators: ts.ObjectLiteralExpression[] = [];
    for (const deco of ctorParam.decorators) {
      decorators.push(extractMetadataFromSingleDecorator(deco, diagnostics));
    }
    if (decorators.length) {
      members.push(ts.createPropertyAssignment('decorators', ts.createArrayLiteral(decorators)));
    }
    params.push(ts.createObjectLiteral(members));
  }

  const initializer = ts.createArrowFunction(
      undefined, undefined, [], undefined, ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      ts.createArrayLiteral(params, true));
  const type = createCtorParametersClassPropertyType();
  const ctorProp = ts.createProperty(
      undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], 'ctorParameters', undefined, type,
      initializer);
  addNoCollapseComment(ctorProp);
  return ctorProp;
}

/**
 * createPropDecoratorsClassProperty creates a static 'propDecorators' property containing type
 * information for every property that has a decorator applied.
 *
 *     static propDecorators: {[key: string]: {type: Function, args?: any[]}[]} = {
 *       propA: [{type: MyDecorator, args: [1, 2]}, ...],
 *       ...
 *     };
 */
function createPropDecoratorsClassProperty(
    diagnostics: ts.Diagnostic[], properties: Map<string, ts.Decorator[]>): ts.PropertyDeclaration {
  //  `static propDecorators: {[key: string]: ` + {type: Function, args?: any[]}[] + `} = {\n`);
  const entries: ts.ObjectLiteralElementLike[] = [];
  for (const [name, decorators] of properties.entries()) {
    entries.push(ts.createPropertyAssignment(
        name,
        ts.createArrayLiteral(
            decorators.map(deco => extractMetadataFromSingleDecorator(deco, diagnostics)))));
  }
  const initializer = ts.createObjectLiteral(entries, true);
  const type = ts.createTypeLiteralNode([ts.createIndexSignature(
      undefined, undefined, [ts.createParameter(
                                undefined, undefined, undefined, 'key', undefined,
                                ts.createTypeReferenceNode('string', undefined), undefined)],
      createDecoratorInvocationType())]);
  return ts.createProperty(
      undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], 'propDecorators', undefined, type,
      initializer);
}

function isNameEqual(classMember: ts.ClassElement, name: string): boolean {
  if (classMember.name === undefined) {
    return false;
  }
  const id = classMember.name as ts.Identifier;
  return id.text === name;
}

/**
 * Returns an expression representing the (potentially) value part for the given node.
 *
 * This is a partial re-implementation of TypeScript's serializeTypeReferenceNode. This is a
 * workaround for https://github.com/Microsoft/TypeScript/issues/17516 (serializeTypeReferenceNode
 * not being exposed). In practice this implementation is sufficient for Angular's use of type
 * metadata.
 */
function typeReferenceToExpression(
    entityNameToExpression: (n: ts.EntityName) => ts.Expression | undefined,
    node: ts.TypeNode): ts.Expression|undefined {
  let kind = node.kind;
  if (ts.isLiteralTypeNode(node)) {
    // Treat literal types like their base type (boolean, string, number).
    kind = node.literal.kind;
  }
  switch (kind) {
    case ts.SyntaxKind.FunctionType:
    case ts.SyntaxKind.ConstructorType:
      return ts.createIdentifier('Function');
    case ts.SyntaxKind.ArrayType:
    case ts.SyntaxKind.TupleType:
      return ts.createIdentifier('Array');
    case ts.SyntaxKind.TypePredicate:
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
    case ts.SyntaxKind.BooleanKeyword:
      return ts.createIdentifier('Boolean');
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.StringKeyword:
      return ts.createIdentifier('String');
    case ts.SyntaxKind.ObjectKeyword:
      return ts.createIdentifier('Object');
    case ts.SyntaxKind.NumberKeyword:
    case ts.SyntaxKind.NumericLiteral:
      return ts.createIdentifier('Number');
    case ts.SyntaxKind.TypeReference:
      const typeRef = node as ts.TypeReferenceNode;
      // Ignore any generic types, just return the base type.
      return entityNameToExpression(typeRef.typeName);
    default:
      return undefined;
  }
}

/** ParameterDecorationInfo describes the information for a single constructor parameter. */
interface ParameterDecorationInfo {
  /**
   * The type declaration for the parameter. Only set if the type is a value (e.g. a class, not an
   * interface).
   */
  type: ts.TypeNode|null;
  /** The list of decorators found on the parameter, null if none. */
  decorators: ts.Decorator[];
}

/**
 * Transformer factory for the decorator downlevel transformer. See fileoverview for details.
 */
export function decoratorDownlevelTransformer(
    typeChecker: ts.TypeChecker, diagnostics: ts.Diagnostic[]):
    (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    /** A map from symbols to the identifier of an import, reset per SourceFile. */
    let importNamesBySymbol = new Map<ts.Symbol, ts.Identifier>();

    /**
     * Converts an EntityName (from a type annotation) to an expression (accessing a value).
     *
     * For a given ts.EntityName, this walks depth first to find the leftmost ts.Identifier, then
     * converts the path into property accesses.
     *
     * This generally works, but TypeScript's emit pipeline does not serialize identifiers that are
     * only used in a type location (such as identifiers in a TypeNode), even if the identifier
     * itself points to a value (e.g. a class). To avoid that problem, this method finds the symbol
     * representing the identifier (using typeChecker), then looks up where it was imported (using
     * importNamesBySymbol), and then uses the imported name instead of the identifier from the type
     * expression, if any. Otherwise it'll use the identifier unchanged. This makes sure the
     * identifier is not marked as stemming from a "type only" expression, causing it to be emitted
     * and causing the import to be retained.
     */
    function entityNameToExpression(name: ts.EntityName): ts.Expression|undefined {
      const sym = typeChecker.getSymbolAtLocation(name);
      if (!sym) return undefined;
      // Check if the entity name references a symbol that is an actual value. If it is not, it
      // cannot be referenced by an expression, so return undefined.
      if (!symbolIsValue(typeChecker, sym)) return undefined;

      if (ts.isIdentifier(name)) {
        // If there's a known import name for this symbol, use it so that the import will be
        // retained and the value can be referenced.
        if (importNamesBySymbol.has(sym)) return importNamesBySymbol.get(sym)!;
        // Otherwise this will be a locally declared name, just return that.
        return name;
      }
      const ref = entityNameToExpression(name.left);
      if (!ref) return undefined;
      return ts.createPropertyAccess(ref, name.right);
    }

    /**
     * Transforms a class element. Returns a three tuple of name, transformed element, and
     * decorators found. Returns an undefined name if there are no decorators to lower on the
     * element, or the element has an exotic name.
     */
    function transformClassElement(element: ts.PropertyDeclaration|ts.GetAccessorDeclaration|
                                   ts.SetAccessorDeclaration|ts.MethodDeclaration):
        [string|undefined, ts.ClassElement, ts.Decorator[]] {
      element = ts.visitEachChild(element, visitor, context);
      const decoratorsToKeep: ts.Decorator[] = [];
      const toLower: ts.Decorator[] = [];
      for (const decorator of element.decorators || []) {
        if (!shouldLower(decorator, typeChecker)) {
          decoratorsToKeep.push(decorator);
          continue;
        }
        toLower.push(decorator);
      }
      if (!toLower.length) return [undefined, element, []];

      if (!element.name || element.name.kind !== ts.SyntaxKind.Identifier) {
        // Method has a weird name, e.g.
        //   [Symbol.foo]() {...}
        diagnostics.push({
          file: element.getSourceFile(),
          start: element.getStart(),
          length: element.getEnd() - element.getStart(),
          messageText: `cannot process decorators on strangely named method`,
          category: ts.DiagnosticCategory.Error,
          code: 0,
        });
        return [undefined, element, []];
      }

      const name = (element.name as ts.Identifier).text;
      let newNode: ts.ClassElement;
      const decorators = decoratorsToKeep.length ?
          ts.setTextRange(ts.createNodeArray(decoratorsToKeep), element.decorators) :
          undefined;
      switch (element.kind) {
        case ts.SyntaxKind.PropertyDeclaration:
          newNode = ts.factory.updatePropertyDeclaration(element, decorators, 
            element.modifiers, element.name, element.questionToken ?? element.exclamationToken, element.type, element.initializer);
          break;
        case ts.SyntaxKind.GetAccessor:
          newNode = ts.factory.updateGetAccessorDeclaration(
              element, decorators, element.modifiers, element.name, element.parameters,
              element.type, element.body);
          break;
        case ts.SyntaxKind.SetAccessor:
          newNode = ts.factory.updateSetAccessorDeclaration(
              element, decorators, element.modifiers, element.name, element.parameters,
              element.body);
          break;
        case ts.SyntaxKind.MethodDeclaration:
          newNode = ts.factory.updateMethodDeclaration(
              element, decorators, element.modifiers, element.asteriskToken, element.name,
              element.questionToken, element.typeParameters, element.parameters, element.type,
              element.body);
          break;
        default:
          throw new Error(`unexpected element: ${element}`);
      }
      return [name, newNode, toLower];
    }

    /**
     * Transforms a constructor. Returns the transformed constructor and the list of parameter
     * information collected, consisting of decorators and optional type.
     */
    function transformConstructor(ctor: ts.ConstructorDeclaration):
        [ts.ConstructorDeclaration, ParameterDecorationInfo[]] {
      ctor = ts.visitEachChild(ctor, visitor, context);

      const newParameters: ts.ParameterDeclaration[] = [];
      const oldParameters = ts.visitParameterList(ctor.parameters, visitor, context);
      const parametersInfo: ParameterDecorationInfo[] = [];
      for (const param of oldParameters) {
        const decoratorsToKeep: ts.Decorator[] = [];
        const paramInfo: ParameterDecorationInfo = {decorators: [], type: null};

        for (const decorator of param.decorators || []) {
          if (!shouldLower(decorator, typeChecker)) {
            decoratorsToKeep.push(decorator);
            continue;
          }
          paramInfo!.decorators.push(decorator);
        }
        if (param.type) {
          // param has a type provided, e.g. "foo: Bar".
          // The type will be emitted as a value expression in entityNameToExpression, which takes
          // care not to emit anything for types that cannot be expressed as a value (e.g.
          // interfaces).
          paramInfo!.type = param.type;
        }
        parametersInfo.push(paramInfo);
        const newParam = ts.updateParameter(
            param,
            // Must pass 'undefined' to avoid emitting decorator metadata.
            decoratorsToKeep.length ? decoratorsToKeep : undefined, param.modifiers,
            param.dotDotDotToken, param.name, param.questionToken, param.type, param.initializer);
        newParameters.push(newParam);
      }
      const updated = ts.updateConstructor(
          ctor, ctor.decorators, ctor.modifiers, newParameters,
          ts.visitFunctionBody(ctor.body, visitor, context));
      return [updated, parametersInfo];
    }

    /**
     * Transforms a single class declaration:
     * - dispatches to strip decorators on members
     * - converts decorators on the class to annotations
     * - creates a ctorParameters property
     * - creates a propDecorators property
     */
    function transformClassDeclaration(classDecl: ts.ClassDeclaration): ts.ClassDeclaration {
      classDecl = ts.getMutableClone(classDecl);

      const newMembers: ts.ClassElement[] = [];
      const decoratedProperties = new Map<string, ts.Decorator[]>();
      let classParameters: ParameterDecorationInfo[]|null = null;

      for (const member of classDecl.members) {
        switch (member.kind) {
          case ts.SyntaxKind.PropertyDeclaration:
          case ts.SyntaxKind.GetAccessor:
          case ts.SyntaxKind.SetAccessor:
          case ts.SyntaxKind.MethodDeclaration: {
            const [name, newMember, decorators] = transformClassElement(
                member as ts.PropertyDeclaration | ts.GetAccessorDeclaration |
                ts.SetAccessorDeclaration | ts.MethodDeclaration);
            newMembers.push(newMember);
            if (name) decoratedProperties.set(name, decorators);
            continue;
          }
          case ts.SyntaxKind.Constructor: {
            const ctor = member as ts.ConstructorDeclaration;
            if (!ctor.body) break;
            const [newMember, parametersInfo] =
                transformConstructor(member as ts.ConstructorDeclaration);
            classParameters = parametersInfo;
            newMembers.push(newMember);
            continue;
          }
          default:
            break;
        }
        newMembers.push(ts.visitEachChild(member, visitor, context));
      }
      const decorators = classDecl.decorators || [];

      const decoratorsToLower = [];
      const decoratorsToKeep: ts.Decorator[] = [];
      for (const decorator of decorators) {
        if (shouldLower(decorator, typeChecker)) {
          decoratorsToLower.push(extractMetadataFromSingleDecorator(decorator, diagnostics));
        } else {
          decoratorsToKeep.push(decorator);
        }
      }

      // const newClassDeclaration = ts.getMutableClone(classDecl);

      if (decoratorsToLower.length) {
        newMembers.push(createDecoratorClassProperty(decoratorsToLower));
      }
      if (classParameters) {
        if ((decoratorsToLower.length) || classParameters.some(p => !!p.decorators.length)) {
          // emit ctorParameters if the class was decoratored at all, or if any of its ctors
          // were classParameters
          newMembers.push(createCtorParametersClassProperty(
              diagnostics, entityNameToExpression, classParameters));
        }
      }
      if (decoratedProperties.size) {
        newMembers.push(createPropDecoratorsClassProperty(diagnostics, decoratedProperties));
      }
      const newDecorators = decoratorsToKeep.length ? ts.createNodeArray(decoratorsToKeep) : undefined;
      return ts.factory.updateClassDeclaration(
          classDecl, newDecorators, classDecl.modifiers, classDecl.name, classDecl.typeParameters,
          classDecl.heritageClauses,
          ts.setTextRange(
              ts.createNodeArray(newMembers, classDecl.members.hasTrailingComma),
              classDecl.members));
    }

    function visitor(node: ts.Node): ts.Node {
      switch (node.kind) {
        case ts.SyntaxKind.SourceFile: {
          importNamesBySymbol = new Map<ts.Symbol, ts.Identifier>();
          return ts.visitEachChild(node, visitor, context);
        }
        case ts.SyntaxKind.ImportDeclaration: {
          const impDecl = node as ts.ImportDeclaration;
          if (impDecl.importClause) {
            const importClause = impDecl.importClause;
            const names = [];
            if (importClause.name) {
              names.push(importClause.name);
            }
            if (importClause.namedBindings &&
                importClause.namedBindings.kind === ts.SyntaxKind.NamedImports) {
              const namedImports = importClause.namedBindings as ts.NamedImports;
              names.push(...namedImports.elements.map(e => e.name));
            }
            for (const name of names) {
              const sym = typeChecker.getSymbolAtLocation(name)!;
              importNamesBySymbol.set(sym, name);
            }
          }
          return ts.visitEachChild(node, visitor, context);
        }
        case ts.SyntaxKind.ClassDeclaration: {
          return transformClassDeclaration(node as ts.ClassDeclaration);
        }
        default:
          return visitEachChild(node, visitor, context);
      }
    }

    return (sf: ts.SourceFile) => visitor(sf) as ts.SourceFile;
  };
}
