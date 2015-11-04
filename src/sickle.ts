import * as ts from 'typescript';

export function formatDiagnostics(diags: ts.Diagnostic[]): string {
  return diags.map((d) => {
                let res = ts.DiagnosticCategory[d.category];
                if (d.file) res += ' at ' + d.file.fileName + ':';
                if (d.start) {
                  let {line, character} = d.file.getLineAndCharacterOfPosition(d.start);
                  res += line + ':' + character + ':';
                }
                res += ' ' + d.messageText;
                return res;
              })
      .join('\n');
}

export type StringMap = {
  [fileName: string]: string
};

export type AnnotatedProgram = StringMap;

const VISIBILITY_FLAGS = ts.NodeFlags.Private | ts.NodeFlags.Protected | ts.NodeFlags.Public;

/**
 * A source processor that takes TypeScript code and annotates the output with Closure-style JSDoc
 * comments.
 */
class Annotator {
  private output: string[];

  constructor() {}

  annotate(args: string[]): AnnotatedProgram {
    let tsArgs = ts.parseCommandLine(args);
    if (tsArgs.errors) {
      this.fail(formatDiagnostics(tsArgs.errors));
    }
    let program = ts.createProgram(tsArgs.fileNames, tsArgs.options);
    let diags = ts.getPreEmitDiagnostics(program);
    if (diags && diags.length) this.fail(formatDiagnostics(diags));
    return this.annotateProgram(program);
  }

  annotateProgram(program: ts.Program): AnnotatedProgram {
    let res: AnnotatedProgram = {};
    for (let sf of program.getSourceFiles()) {
      if (sf.fileName.match(/\.d\.ts$/)) continue;
      this.output = [];
      this.visit(sf);
      res[sf.fileName] = this.output.join('');
    }
    return res;
  }

  private emit(str: string) { this.output.push(str); }

  private visit(node: ts.Node) {
    // console.log('node:', (<any>ts).SyntaxKind[node.kind]);
    switch (node.kind) {
      case ts.SyntaxKind.VariableDeclaration:
        this.maybeVisitType((<ts.VariableDeclaration>node).type);
        this.writeNode(node);
        break;
      case ts.SyntaxKind.ClassDeclaration: {
        let classNode = <ts.ClassDeclaration>node;
        let hasCtor = classNode.members.some((e) => e.kind === ts.SyntaxKind.Constructor);
        if (hasCtor) {
          this.writeNode(classNode);
          break;
        }
        // Emit a synthetic ctor.
        // TODO(martinprobst): Handle inherited parent ctors.
        this.writeTextBetween(classNode, classNode.getLastToken());
        this.emit('constructor() {\n');
        this.emitStubDeclarations(classNode, []);
        this.emit('}\n');
        this.writeNode(classNode.getLastToken());
        break;
      }
      case ts.SyntaxKind.Constructor: {
        let ctor = <ts.ConstructorDeclaration>node;
        this.writeTextBetween(ctor, ctor.body);
        if (ctor.body.statements.length) {
          // Insert before the first code in the ctor.
          this.writeTextBetween(ctor.body, ctor.body.statements[0]);
        } else {
          // Empty ctor - just insert before the end of it.
          this.writeTextBetween(ctor.body, ctor.body.getLastToken());
        }

        let paramProps = ctor.parameters.filter((p) => !!(p.flags & VISIBILITY_FLAGS));
        this.emitStubDeclarations(<ts.ClassLikeDeclaration>ctor.parent, paramProps);

        if (ctor.body.statements.length) {
          let firstStmt = ctor.body.statements[0];
          this.emit(
              ctor.body.getSourceFile().getText().substring(
                  firstStmt.getFullStart(), ctor.body.getEnd()));
        } else {
          let remaining = ctor.getSourceFile().getText().substring(
              ctor.body.getLastToken().getFullStart(), ctor.body.getEnd());
          this.emit(remaining);
        }

        break;
      }
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.ArrowFunction:
        let fnDecl = <ts.FunctionLikeDeclaration>node;
        this.maybeVisitType(fnDecl.type, '@return');
        let writeOffset = fnDecl.getFullStart();
        // Parameters.
        if (fnDecl.parameters.length) {
          for (let param of fnDecl.parameters) {
            this.writeTextFromOffset(writeOffset, param);
            writeOffset = param.getEnd();
            this.maybeVisitType(param.type);
            this.visit(param);
          }
        }
        // Return type.
        if (fnDecl.type) {
          this.writeTextFromOffset(writeOffset, fnDecl.type);
          this.visit(fnDecl.type);
          writeOffset = fnDecl.type.getEnd();
        }
        // Body.
        this.writeTextFromOffset(writeOffset, fnDecl.body);
        this.visit(fnDecl.body);
        break;
      default:
        this.writeNode(node);
        break;
    }
  }

  private emitStubDeclarations(
      classDecl: ts.ClassLikeDeclaration, paramProps: ts.ParameterDeclaration[]) {
    this.emit('\n\n// Sickle: begin stub declarations.\n');
    this.emit('\n');
    let props = <ts.PropertyDeclaration[]>(
        classDecl.members.filter((e) => e.kind === ts.SyntaxKind.PropertyDeclaration));
    props.forEach((p) => this.visitProperty(p));
    paramProps.forEach((p) => this.visitProperty(p));
    this.emit('// Sickle: end stub declarations.\n');
  }

  private visitProperty(p: ts.PropertyDeclaration | ts.ParameterDeclaration) {
    this.maybeVisitType(p.type, '@type');
    this.emit('\nthis.');
    this.emit(p.name.getText());
    this.emit(';');
    this.emit('\n');
  }

  private maybeVisitType(type: ts.TypeNode, jsDocTag?: string) {
    if (!type) return;
    this.emit(' /**');
    if (jsDocTag) {
      this.emit(' ');
      this.emit(jsDocTag);
      this.emit(' {');
    }
    this.visit(type);
    if (jsDocTag) {
      this.emit('}');
    }
    this.emit(' */');
  }

  private writeNode(node: ts.Node) {
    if (node.getChildCount() == 0) {
      // Directly write complete tokens.
      this.emit(node.getFullText());
      return;
    }
    let lastEnd = node.getFullStart();
    for (let child of node.getChildren()) {
      let childStart = child.getFullStart();
      this.writeSourceBefore(lastEnd, child);
      this.visit(child);
      lastEnd = child.getEnd();
    }
    // Write any trailing text.
    let text = node.getSourceFile().getText().slice(lastEnd, node.getEnd());
    if (text) this.emit(text);
  }

  private writeTextBetween(node: ts.Node, to: ts.Node) {
    let text = node.getSourceFile().getText().slice(node.getFullStart(), to.getFullStart());
    if (text) this.emit(text);
  }

  private writeTextFromOffset(from: number, to: ts.Node) {
    let text = to.getSourceFile().getText().slice(from, to.getFullStart());
    if (text) this.emit(text);
  }

  private writeSourceBefore(offset: number, node: ts.Node) {
    if (node.getFullStart() == offset) return;
    assert(node.getFullStart() > offset, 'Offset must not be smaller');
    this.emit(node.getSourceFile().getText().slice(offset, node.getFullStart()));
  }

  private fail(msg: string) { throw new Error(msg); }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

function last<T>(elems: T[]): T {
  return elems.length ? elems[elems.length - 1] : null;
}

export function annotateProgram(program: ts.Program): AnnotatedProgram {
  return new Annotator().annotateProgram(program);
}

// CLI entry point
if (require.main === module) {
  let res = new Annotator().annotate(process.argv);
  // TODO(martinprobst): Do something useful here...
  console.log(JSON.stringify(res));
}
