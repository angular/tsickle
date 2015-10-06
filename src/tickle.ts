import * as ts from 'typescript';

export function formatDiagnostics(diags: ts.Diagnostic[]): string {
  return diags.map((d) => {
                let res = ts.DiagnosticCategory[d.category];
                if (d.file) res += d.file + ':';
                if (d.start) {
                  let{line, character} = d.file.getLineAndCharacterOfPosition(d.start);
                  res += line + ':' + character + ':';
                }
                res += d.messageText;
                return res;
              })
      .join('\n');
}

export type AnnotatedProgram = { [fileName: string]: string };

/**
 * A source processor that takes TypeScript code and annotates the output with Closure-style JSDoc
 * comments.
 */
class Annotator {
  private output: string[];

  constructor() {}

  transform(args: string[]): AnnotatedProgram {
    let tsArgs = ts.parseCommandLine(args);
    if (tsArgs.errors) {
      this.fail(formatDiagnostics(tsArgs.errors));
    }
    let program = ts.createProgram(tsArgs.fileNames, tsArgs.options);
    let diags = ts.getPreEmitDiagnostics(program);
    if (diags && diags.length) this.fail(formatDiagnostics(diags));
    return this.transformProgram(program);
  }

  transformProgram(program: ts.Program): AnnotatedProgram {
    let res: AnnotatedProgram = {};
    for (let sf of program.getSourceFiles()) {
      if (sf.fileName.match(/\.d\.ts$/)) continue;
      this.output = [];
      this.visit(sf);
      res[sf.fileName] = this.output.join('');
    }
    return res;
  }

  private visit(node: ts.Node) {
    // console.log('node:', (<any>ts).SyntaxKind[node.kind]);
    switch (node.kind) {
      case ts.SyntaxKind.VariableDeclaration:
        this.maybeVisitType((<ts.VariableDeclaration>node).type);
        this.writeNode(node);
        break;
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.ArrowFunction:
        let fnDecl = <ts.FunctionLikeDeclaration>node;
        this.maybeVisitType(fnDecl.type, true);
        let writeOffset = fnDecl.getFullStart();
        // Parameters.
        if (fnDecl.parameters.length) {
          for (let param of fnDecl.parameters) {
            this.writeTextBetween(fnDecl, writeOffset, param);
            writeOffset = param.getEnd();
            this.maybeVisitType(param.type);
            this.visit(param);
          }
        }
        // Return type.
        if (fnDecl.type) {
          this.writeTextBetween(fnDecl, writeOffset, fnDecl.type);
          this.visit(fnDecl.type);
          writeOffset = fnDecl.type.getEnd();
        }
        // Body.
        this.writeTextBetween(fnDecl, writeOffset, fnDecl.body);
        this.visit(fnDecl.body);
        break;
      default:
        this.writeNode(node);
        break;
    }
  }

  private maybeVisitType(type: ts.TypeNode, isReturn?: boolean) {
    if (!type) return;
    this.output.push(' /**');
    if (isReturn) {
      this.output.push(' @return {');
    }
    this.visit(type);
    if (isReturn) {
      this.output.push('}');
    }
    this.output.push(' */');
  }

  private writeNode(node: ts.Node, upTo?: number) {
    if (node.getChildCount() == 0) {
      // Directly write complete tokens.
      this.output.push(node.getFullText());
      return;
    }
    let lastEnd = node.getFullStart();
    for (let child of node.getChildren()) {
      let childStart = child.getFullStart();
      this.writeSourceBefore(lastEnd, child);
      this.visit(child);
      lastEnd = child.getEnd();
    }
  }

  private writeTextBetween(node: ts.Node, from: number, to: ts.Node) {
    let text = node.getSourceFile().getText().slice(from, to.getFullStart());
    this.output.push(text);
  }

  private writeSourceBefore(offset: number, node: ts.Node) {
    if (node.getFullStart() == offset) return;
    assert(node.getFullStart() > offset, 'Offset must not be smaller');
    this.output.push(node.getSourceFile().getText().slice(offset, node.getFullStart()));
  }

  private fail(msg: string) { throw new Error(msg); }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

function last<T>(elems: T[]): T {
  return elems.length ? elems[elems.length - 1] : null;
}

export function transformProgram(program: ts.Program): AnnotatedProgram {
  return new Annotator().transformProgram(program);
}

// CLI entry point
if (require.main === module) {
  let res = new Annotator().transform(process.argv);
  // TODO(martinprobst): Do something useful here...
  console.log(JSON.stringify(res));
}
