import * as ts from 'typescript';
import {Rewriter} from './rewriter';

// ClassRewriter rewrites a single "class Foo {...}" declaration.
// It's its own object because we collect decorators on the class and the ctor
// separately for each class we encounter.
class ClassRewriter extends Rewriter {
  /** Decorators on the class itself. */
  decorators: ts.Decorator[];
  /** The constructor parameter list and decorators on each param. */
  ctorParameters: [string, ts.Decorator[]][];
  /** Per-method decorators. */
  propDecorators: {[key: string]: ts.Decorator[]};

  /**
   * process is the main entry point, rewriting a single class node.
   */
  process(node: ts.ClassDeclaration): {output: string, diagnostics: ts.Diagnostic[]} {
    if (node.decorators) {
      this.decorators = node.decorators.slice();
    }
    let pos = node.getFullStart();
    for (let child of node.getChildren()) {
      switch (child.kind) {
        case ts.SyntaxKind.CloseBraceToken:
          // Before writing the close brace, dump the metadata.
          this.writeRange(pos, child.getStart());
          this.emitMetadata();
          this.writeRange(child.getStart(), child.getEnd());
          break;
        default:
          this.writeRange(pos, child.getFullStart());
          this.visit(child);
      }
      pos = child.getEnd();
    }
    return this.getOutput();
  }

  /**
   * gatherConstructor grabs the parameter list and decorators off the class
   * constructor, and emits nothing.
   */
  private gatherConstructor(ctor: ts.ConstructorDeclaration) {
    let ctorParameters: [string, ts.Decorator[]][] = [];
    let hasDecoratedParam = false;
    for (let param of ctor.parameters) {
      let paramCtor: string;
      let decorators: ts.Decorator[];
      if (param.decorators) {
        decorators = param.decorators.slice();
        hasDecoratedParam = true;
      }
      if (param.type) {
        switch (param.type.kind) {
          case ts.SyntaxKind.TypeReference:
            let typeRef = param.type as ts.TypeReferenceNode;
            // Type reference can be a bare name or a qualified name (foo.bar),
            // possibly followed by type arguments (<X, Y>).
            // We are making the assumption that a type reference is the same
            // name as a ctor for that type, and it's simplest to just use the
            // source text. We use `typeName` to avoid emitting type parameters.
            paramCtor = typeRef.typeName.getText();
            break;
          default:
            // Some other type of type; just ignore it.
        }
      }
      if (paramCtor || decorators) {
        ctorParameters.push([paramCtor, decorators]);
      } else {
        ctorParameters.push(null);
      }
    }

    // Use the ctor parameter metadata only if the class or the ctor was decorated.
    if (this.decorators || hasDecoratedParam) {
      this.ctorParameters = ctorParameters;
    }
  }

  /**
   * gatherMethod grabs the decorators off a class method and emits nothing.
   */
  private gatherMethodOrProperty(method: ts.Declaration) {
    if (!method.decorators) return;
    if (method.name.kind !== ts.SyntaxKind.Identifier) {
      // Method has a weird name, e.g.
      //   [Symbol.foo]() {...}
      this.error(method, `cannot process decorators on ${ts.SyntaxKind[method.name.kind]}`);
      return;
    }

    let name = (method.name as ts.Identifier).text;
    let decorators: ts.Decorator[] = method.decorators.slice();
    if (!this.propDecorators) this.propDecorators = {};
    this.propDecorators[name] = decorators;
  }

  /**
   * maybeProcess is called by the traversal of the AST.
   * @return True if the node was handled, false to have the node emitted as normal.
   */
  protected maybeProcess(node: ts.Node): boolean {
    switch (node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
        // Encountered a new class while processing this class; use a new separate
        // rewriter to gather+emit its metadata.
        let {output, diagnostics} =
            new ClassRewriter(this.file).process(node as ts.ClassDeclaration);
        this.diagnostics.push(...diagnostics);
        this.emit(output);
        return true;
      case ts.SyntaxKind.Constructor:
        this.gatherConstructor(node as ts.ConstructorDeclaration);
        return false;  // Proceed with ordinary emit of the ctor.
      case ts.SyntaxKind.PropertyDeclaration:
      case ts.SyntaxKind.SetAccessor:
      case ts.SyntaxKind.GetAccessor:
      case ts.SyntaxKind.MethodDeclaration:
        this.gatherMethodOrProperty(node as ts.Declaration);
        return false;  // Proceed with ordinary emit of the method.
      case ts.SyntaxKind.Decorator:
        // Skip emit of all decorators, as they are specially handled.
        return true;
      default:
        return false;
    }
  }

  /**
   * emitMetadata emits the various gathered metadata, as static fields.
   */
  private emitMetadata() {
    if (this.decorators) {
      this.emit(`/** @nocollapse */\n`);
      this.emit(`static decorators: DecoratorInvocation[] = [\n`);
      for (let annotation of this.decorators) {
        this.emitDecorator(annotation);
        this.emit(',\n');
      }
      this.emit('];\n');
    }

    if (this.ctorParameters) {
      this.emit(`/** @nocollapse */\n`);
      this.emit(
          `static ctorParameters: {type: Function, decorators?: DecoratorInvocation[]}[] = [\n`);
      for (let param of this.ctorParameters) {
        if (!param) {
          this.emit('null,\n');
          continue;
        }
        let [ctor, decorators] = param;
        this.emit(`{type: ${ctor}, `);
        if (decorators) {
          this.emit('decorators: [');
          for (let decorator of decorators) {
            this.emitDecorator(decorator);
            this.emit(', ');
          }
          this.emit(']');
        }
        this.emit('},\n');
      }
      this.emit(`];\n`);
    }

    if (this.propDecorators) {
      this.emit(`/** @nocollapse */\n`);
      this.emit('static propDecorators: {[key: string]: DecoratorInvocation[]} = {\n');
      for (let name of Object.keys(this.propDecorators)) {
        this.emit(`'${name}': [`);
        for (let decorator of this.propDecorators[name]) {
          this.emitDecorator(decorator);
          this.emit(',');
        }
        this.emit('],\n');
      }
      this.emit('};\n');
    }
  }

  private emitDecorator(decorator: ts.Decorator) {
    this.emit('{ type: ');
    let expr = decorator.expression;
    switch (expr.kind) {
      case ts.SyntaxKind.Identifier:
        // The decorator was a plain @Foo.
        this.visit(expr);
        break;
      case ts.SyntaxKind.CallExpression:
        // The decorator was a call, like @Foo(bar).
        let call = expr as ts.CallExpression;
        this.visit(call.expression);
        if (call.arguments.length) {
          this.emit(', args: [');
          for (let arg of call.arguments) {
            this.emit(arg.getText());
            this.emit(', ');
          }
          this.emit(']');
        }
        break;
      default:
        this.errorUnimplementedKind(expr, 'gathering metadata');
        this.emit('undefined');
    }
    this.emit(' }');
  }
}

class DecoratorRewriter extends Rewriter {
  process(): {output: string, diagnostics: ts.Diagnostic[]} {
    this.visit(this.file);
    return this.getOutput();
  }

  protected maybeProcess(node: ts.Node): boolean {
    switch (node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
        let {output, diagnostics} =
            new ClassRewriter(this.file).process(node as ts.ClassDeclaration);
        this.diagnostics.push(...diagnostics);
        this.emit(output);
        return true;
      default:
        return false;
    }
  }
}

export function convertDecorators(
    fileName: string, sourceText: string): {output: string, diagnostics: ts.Diagnostic[]} {
  let file = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.ES5, true);
  return new DecoratorRewriter(file).process();
}
