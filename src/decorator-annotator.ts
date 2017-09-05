/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SourceMapGenerator} from 'source-map';
import * as ts from 'typescript';

import {getDecoratorDeclarations} from './decorators';
import {getIdentifierText, Rewriter} from './rewriter';
import {SourceMapper} from './source_map_utils';
import {TypeTranslator} from './type-translator';
import {toArray} from './util';

/**
 * ConstructorParameters are gathered from constructors, so that their type information and
 * decorators can later be emitted as an annotation.
 */
interface ConstructorParameter {
  /**
   * The type declaration for the parameter. Only set if the type is a value (e.g. a class, not an
   * interface).
   */
  type: ts.TypeNode|null;
  /** The list of decorators found on the parameter, null if none. */
  decorators: ts.Decorator[]|null;
}

// DecoratorClassVisitor rewrites a single "class Foo {...}" declaration.
// It's its own object because we collect decorators on the class and the ctor
// separately for each class we encounter.
export class DecoratorClassVisitor {
  /** Decorators on the class itself. */
  decorators: ts.Decorator[];
  /** The constructor parameter list and decorators on each param. */
  private ctorParameters: ConstructorParameter[];
  /** Per-method decorators. */
  propDecorators: Map<string, ts.Decorator[]>;

  constructor(
      private typeChecker: ts.TypeChecker, private rewriter: Rewriter,
      private classDecl: ts.ClassDeclaration,
      private importedNames: Array<{name: ts.Identifier, declarationNames: ts.Identifier[]}>) {
    if (classDecl.decorators) {
      const toLower = this.decoratorsToLower(classDecl);
      if (toLower.length > 0) this.decorators = toLower;
    }
  }

  /**
   * Determines whether the given decorator should be re-written as an annotation.
   */
  private shouldLower(decorator: ts.Decorator) {
    for (const d of getDecoratorDeclarations(decorator, this.typeChecker)) {
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
      const range = ts.getLeadingCommentRanges(commentNode.getFullText(), 0);
      if (!range) continue;
      for (const {pos, end} of range) {
        const jsDocText = commentNode.getFullText().substring(pos, end);
        if (jsDocText.includes('@Annotation')) return true;
      }
    }
    return false;
  }

  private decoratorsToLower(n: ts.Node): ts.Decorator[] {
    if (n.decorators) {
      return n.decorators.filter((d) => this.shouldLower(d));
    }
    return [];
  }

  /**
   * gatherConstructor grabs the parameter list and decorators off the class
   * constructor, and emits nothing.
   */
  private gatherConstructor(ctor: ts.ConstructorDeclaration) {
    const ctorParameters: ConstructorParameter[] = [];
    let hasDecoratedParam = false;
    for (const param of ctor.parameters) {
      const ctorParam: ConstructorParameter = {type: null, decorators: null};
      if (param.decorators) {
        ctorParam.decorators = this.decoratorsToLower(param);
        hasDecoratedParam = hasDecoratedParam || ctorParam.decorators.length > 0;
      }
      if (param.type) {
        // param has a type provided, e.g. "foo: Bar".
        // Verify that "Bar" is a value (e.g. a constructor) and not just a type.
        const sym = this.typeChecker.getTypeAtLocation(param.type).getSymbol();
        if (sym && (sym.flags & ts.SymbolFlags.Value)) {
          ctorParam.type = param.type;
        }
      }
      ctorParameters.push(ctorParam);
    }

    // Use the ctor parameter metadata only if the class or the ctor was decorated.
    if (this.decorators || hasDecoratedParam) {
      this.ctorParameters = ctorParameters;
    }
  }

  /**
   * gatherMethod grabs the decorators off a class method and emits nothing.
   */
  private gatherMethodOrProperty(method: ts.NamedDeclaration) {
    if (!method.decorators) return;
    if (!method.name || method.name.kind !== ts.SyntaxKind.Identifier) {
      // Method has a weird name, e.g.
      //   [Symbol.foo]() {...}
      this.rewriter.error(method, 'cannot process decorators on strangely named method');
      return;
    }

    const name = (method.name as ts.Identifier).text;
    const decorators: ts.Decorator[] = this.decoratorsToLower(method);
    if (decorators.length === 0) return;
    if (!this.propDecorators) this.propDecorators = new Map<string, ts.Decorator[]>();
    this.propDecorators.set(name, decorators);
  }

  /**
   * For lowering decorators, we need to refer to constructor types.
   * So we start with the identifiers that represent these types.
   * However, TypeScript does not allow us to emit them in a value position
   * as it associated different symbol information with it.
   *
   * This method looks for the place where the value that is associated to
   * the type is defined and returns that identifier instead.
   *
   * This might be simplified when https://github.com/Microsoft/TypeScript/issues/17516 is solved.
   */
  private getValueIdentifierForType(typeSymbol: ts.Symbol, typeNode: ts.TypeNode): ts.Identifier
      |null {
    const valueDeclaration = typeSymbol.valueDeclaration as ts.NamedDeclaration;
    if (!valueDeclaration) return null;
    const valueName = valueDeclaration.name;
    if (!valueName || valueName.kind !== ts.SyntaxKind.Identifier) {
      return null;
    }
    if (valueName.getSourceFile() === this.rewriter.file) {
      return valueName;
    }
    // Need to look at the first identifier only
    // to ignore generics.
    const firstIdentifierInType = firstIdentifierInSubtree(typeNode);
    if (firstIdentifierInType) {
      for (const {name, declarationNames} of this.importedNames) {
        if (firstIdentifierInType.text === name.text &&
            declarationNames.some(d => d === valueName)) {
          return name;
        }
      }
    }
    return null;
  }

  beforeProcessNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.Constructor:
        this.gatherConstructor(node as ts.ConstructorDeclaration);
        break;
      case ts.SyntaxKind.PropertyDeclaration:
      case ts.SyntaxKind.SetAccessor:
      case ts.SyntaxKind.GetAccessor:
      case ts.SyntaxKind.MethodDeclaration:
        this.gatherMethodOrProperty(node as ts.Declaration);
        break;
      default:
    }
  }

  maybeProcessDecorator(node: ts.Decorator, start?: number): boolean {
    if (this.shouldLower(node)) {
      // Return true to signal that this node should not be emitted,
      // but still emit the whitespace *before* the node.
      if (!start) {
        start = node.getFullStart();
      }
      this.rewriter.writeRange(node, start, node.getStart());
      return true;
    }
    return false;
  }

  foundDecorators(): boolean {
    return !!(this.decorators || this.ctorParameters || this.propDecorators);
  }

  /**
   * emits the types for the various gathered metadata to be used
   * in the tsickle type annotations helper.
   */
  emitMetadataTypeAnnotationsHelpers() {
    if (!this.classDecl.name) return;
    const className = getIdentifierText(this.classDecl.name);
    if (this.decorators) {
      this.rewriter.emit(`/** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */\n`);
      this.rewriter.emit(`${className}.decorators;\n`);
    }
    if (this.decorators || this.ctorParameters) {
      this.rewriter.emit(`/**\n`);
      this.rewriter.emit(` * @nocollapse\n`);
      this.rewriter.emit(
          ` * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}\n`);
      this.rewriter.emit(` */\n`);
      this.rewriter.emit(`${className}.ctorParameters;\n`);
    }
    if (this.propDecorators) {
      this.rewriter.emit(
          `/** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */\n`);
      this.rewriter.emit(`${className}.propDecorators;\n`);
    }
  }

  /**
   * emitMetadata emits the various gathered metadata, as static fields.
   */
  emitMetadataAsStaticProperties() {
    const decoratorInvocations = '{type: Function, args?: any[]}[]';
    if (this.decorators) {
      this.rewriter.emit(`static decorators: ${decoratorInvocations} = [\n`);
      for (const annotation of this.decorators) {
        this.emitDecorator(annotation);
        this.rewriter.emit(',\n');
      }
      this.rewriter.emit('];\n');
    }

    if (this.decorators || this.ctorParameters) {
      this.rewriter.emit(`/** @nocollapse */\n`);
      // ctorParameters may contain forward references in the type: field, so wrap in a function
      // closure
      this.rewriter.emit(
          `static ctorParameters: () => ({type: any, decorators?: ` + decoratorInvocations +
          `}|null)[] = () => [\n`);
      for (const param of this.ctorParameters || []) {
        if (!param.type && !param.decorators) {
          this.rewriter.emit('null,\n');
          continue;
        }
        this.rewriter.emit(`{type: `);
        if (!param.type) {
          this.rewriter.emit(`undefined`);
        } else {
          // For transformer mode, tsickle must emit not only the string referring to the type,
          // but also create a source mapping, so that TypeScript can later recognize that the
          // symbol is used in a value position, so that TypeScript emits an import for the
          // symbol.
          // The code below and in getValueIdentifierForType finds the value node corresponding to
          // the type and emits that symbol if possible. This causes a source mapping to the value,
          // which then allows later transformers in the pipeline to do the correct module
          // rewriting. Note that we cannot use param.type as the emit node directly (not even just
          // for mapping), because that is marked as a type use of the node, not a value use, so it
          // doesn't get updated as an export.
          const sym = this.typeChecker.getTypeAtLocation(param.type).getSymbol()!;
          const emitNode = this.getValueIdentifierForType(sym, param.type);
          if (emitNode) {
            this.rewriter.writeRange(emitNode, emitNode.getStart(), emitNode.getEnd());
          } else {
            const typeStr = new TypeTranslator(this.typeChecker, param.type)
                                .symbolToString(sym, /* useFqn */ true);
            this.rewriter.emit(typeStr);
          }
        }
        this.rewriter.emit(`, `);
        if (param.decorators) {
          this.rewriter.emit('decorators: [');
          for (const decorator of param.decorators) {
            this.emitDecorator(decorator);
            this.rewriter.emit(', ');
          }
          this.rewriter.emit(']');
        }
        this.rewriter.emit('},\n');
      }
      this.rewriter.emit(`];\n`);
    }

    if (this.propDecorators) {
      this.rewriter.emit(
          `static propDecorators: {[key: string]: ` + decoratorInvocations + `} = {\n`);
      for (const name of toArray(this.propDecorators.keys())) {
        this.rewriter.emit(`"${name}": [`);

        for (const decorator of this.propDecorators.get(name)!) {
          this.emitDecorator(decorator);
          this.rewriter.emit(',');
        }
        this.rewriter.emit('],\n');
      }
      this.rewriter.emit('};\n');
    }
  }

  private emitDecorator(decorator: ts.Decorator) {
    this.rewriter.emit('{ type: ');
    const expr = decorator.expression;
    switch (expr.kind) {
      case ts.SyntaxKind.Identifier:
        // The decorator was a plain @Foo.
        this.rewriter.visit(expr);
        break;
      case ts.SyntaxKind.CallExpression:
        // The decorator was a call, like @Foo(bar).
        const call = expr as ts.CallExpression;
        this.rewriter.visit(call.expression);
        if (call.arguments.length) {
          this.rewriter.emit(', args: [');
          for (const arg of call.arguments) {
            this.rewriter.writeNodeFrom(arg, arg.getStart());
            this.rewriter.emit(', ');
          }
          this.rewriter.emit(']');
        }
        break;
      default:
        this.rewriter.errorUnimplementedKind(expr, 'gathering metadata');
        this.rewriter.emit('undefined');
    }
    this.rewriter.emit(' }');
  }
}

class DecoratorRewriter extends Rewriter {
  private currentDecoratorConverter: DecoratorClassVisitor;
  private importedNames: Array<{name: ts.Identifier, declarationNames: ts.Identifier[]}> = [];

  constructor(
      private typeChecker: ts.TypeChecker, sourceFile: ts.SourceFile, sourceMapper?: SourceMapper) {
    super(sourceFile, sourceMapper);
  }

  process(): {output: string, diagnostics: ts.Diagnostic[]} {
    this.visit(this.file);
    return this.getOutput();
  }

  protected maybeProcess(node: ts.Node): boolean {
    if (this.currentDecoratorConverter) {
      this.currentDecoratorConverter.beforeProcessNode(node);
    }
    switch (node.kind) {
      case ts.SyntaxKind.ImportDeclaration:
        this.importedNames.push(
            ...collectImportedNames(this.typeChecker, node as ts.ImportDeclaration));
        return false;
      case ts.SyntaxKind.Decorator:
        return this.currentDecoratorConverter &&
            this.currentDecoratorConverter.maybeProcessDecorator(node as ts.Decorator);
      case ts.SyntaxKind.ClassDeclaration:
        const oldDecoratorConverter = this.currentDecoratorConverter;
        this.currentDecoratorConverter = new DecoratorClassVisitor(
            this.typeChecker, this, node as ts.ClassDeclaration, this.importedNames);
        this.writeLeadingTrivia(node);
        visitClassContentIncludingDecorators(
            node as ts.ClassDeclaration, this, this.currentDecoratorConverter);
        this.currentDecoratorConverter = oldDecoratorConverter;
        return true;
      default:
        return false;
    }
  }
}

/**
 * Returns the first identifier in the node tree starting at node
 * in a depth first order.
 *
 * @param node The node to start with
 * @return The first identifier if one was found.
 */
function firstIdentifierInSubtree(node: ts.Node): ts.Identifier|undefined {
  if (node.kind === ts.SyntaxKind.Identifier) {
    return node as ts.Identifier;
  }
  return ts.forEachChild(node, firstIdentifierInSubtree);
}

/**
 * Collect the Identifiers used as named bindings in the given import declaration
 * with their Symbol.
 * This is needed later on to find an identifier that represents the value
 * of an imported type identifier.
 */
export function collectImportedNames(typeChecker: ts.TypeChecker, decl: ts.ImportDeclaration):
    Array<{name: ts.Identifier, declarationNames: ts.Identifier[]}> {
  const importedNames: Array<{name: ts.Identifier, declarationNames: ts.Identifier[]}> = [];
  const importClause = decl.importClause;
  if (!importClause) {
    return importedNames;
  }
  const names: ts.Identifier[] = [];
  if (importClause.name) {
    names.push(importClause.name);
  }
  if (importClause.namedBindings &&
      importClause.namedBindings.kind === ts.SyntaxKind.NamedImports) {
    const namedImports = importClause.namedBindings as ts.NamedImports;
    names.push(...namedImports.elements.map(e => e.name));
  }
  for (const name of names) {
    let symbol = typeChecker.getSymbolAtLocation(name)!;
    if (symbol.flags & ts.SymbolFlags.Alias) {
      symbol = typeChecker.getAliasedSymbol(symbol);
    }
    const declarationNames: ts.Identifier[] = [];
    if (symbol.declarations) {
      for (const d of symbol.declarations) {
        const decl = d as ts.NamedDeclaration;
        if (decl.name && decl.name.kind === ts.SyntaxKind.Identifier) {
          declarationNames.push(decl.name as ts.Identifier);
        }
      }
    }
    if (symbol.declarations) {
      importedNames.push({name, declarationNames});
    }
  }
  return importedNames;
}


export function visitClassContentIncludingDecorators(
    classDecl: ts.ClassDeclaration, rewriter: Rewriter, decoratorVisitor?: DecoratorClassVisitor) {
  if (rewriter.file.text[classDecl.getEnd() - 1] !== '}') {
    rewriter.error(classDecl, 'unexpected class terminator');
    return;
  }
  rewriter.writeNodeFrom(classDecl, classDecl.getStart(), classDecl.getEnd() - 1);
  // At this point, we've emitted up through the final child of the class, so all that
  // remains is the trailing whitespace and closing curly brace.
  // The final character owned by the class node should always be a '}',
  // or we somehow got the AST wrong and should report an error.
  // (Any whitespace or semicolon following the '}' will be part of the next Node.)
  if (decoratorVisitor) {
    decoratorVisitor.emitMetadataAsStaticProperties();
  }
  rewriter.writeRange(classDecl, classDecl.getEnd() - 1, classDecl.getEnd());
}


export function convertDecorators(
    typeChecker: ts.TypeChecker, sourceFile: ts.SourceFile,
    sourceMapper?: SourceMapper): {output: string, diagnostics: ts.Diagnostic[]} {
  return new DecoratorRewriter(typeChecker, sourceFile, sourceMapper).process();
}
