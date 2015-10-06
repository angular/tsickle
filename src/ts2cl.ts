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
    let sf = node.getSourceFile();
    switch (node.kind) {
      case ts.SyntaxKind.VariableDeclaration:
        this.visitType((<ts.VariableDeclaration>node).type);
        this.writeNode(node);
        break;
      default:
        this.writeNode(node);
        break;
    }
  }

  private visitType(type: ts.TypeNode) {
    this.output.push(' /**');
    this.visit(type);
    this.output.push(' */');
  }

  private writeNode(node: ts.Node) {
    var lastEnd = node.getFullStart();
    if (node.getChildCount() == 0) {
      this.output.push(node.getFullText());
      return;
    }
    for (let child of node.getChildren()) {
      let srcBefore = this.getSourceBefore(lastEnd, child);
      if (srcBefore) this.output.push(srcBefore);
      this.visit(child);
      lastEnd = child.getEnd();
    }
  }

  private getSourceBefore(offset: number, node: ts.Node): string {
    if (node.getFullStart() == offset) return null;
    assert(node.getFullStart() > offset, 'Offset must not be smaller');
    return node.getSourceFile().getText().slice(offset, node.getFullStart());
  }

  private fail(msg: string) { throw new Error(msg); }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

export function transformProgram(program: ts.Program): AnnotatedProgram {
  return new Annotator().transformProgram(program);
}

// CLI entry point
if (require.main === module) {
  let res = new Annotator().transform(process.argv);
  console.log(JSON.stringify(res));
}
