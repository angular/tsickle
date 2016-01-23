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

const VISIBILITY_FLAGS = ts.NodeFlags.Private | ts.NodeFlags.Protected | ts.NodeFlags.Public;

/**
 * A source processor that takes TypeScript code and annotates the output with Closure-style JSDoc
 * comments.
 */
class Annotator {
  private output: string[];
  private indent: number;
  private file: ts.SourceFile;

  constructor() { this.indent = 0; }

  annotate(file: ts.SourceFile): string {
    this.output = [];
    this.file = file;
    this.visit(file);
    assert(this.indent == 0, 'visit() failed to track nesting');
    return this.output.join('');
  }

  private emit(str: string) { this.output.push(str); }

  private logWithIndent(message: string) {
    let prefix = new Array(this.indent + 1).join('| ');
    console.log(prefix + message);
  }

  private visit(node: ts.Node) {
    this.indent++;
    // this.logWithIndent('node: ' + (<any>ts).SyntaxKind[node.kind]);
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
          this.writeRange(firstStmt.getFullStart(), ctor.body.getEnd());
        } else {
          this.writeRange(ctor.body.getLastToken().getFullStart(), ctor.body.getEnd());
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
      case ts.SyntaxKind.TypeAliasDeclaration:
        this.visitTypeAlias(<ts.TypeAliasDeclaration>node);
        break;
      default:
        this.writeNode(node);
        break;
    }
    this.indent--;
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
    this.maybeVisitType(p.type, this.existingClosureAnnotation(p) + '@type');
    this.emit('\nthis.');
    this.emit(p.name.getText());
    this.emit(';');
    this.emit('\n');
  }

  /**
   * Returns empty string if there is no existing annotation.
   */
  private existingClosureAnnotation(p: ts.PropertyDeclaration | ts.ParameterDeclaration) {
    let comments = ts.getLeadingCommentRanges(this.file.text, p.pos);
    if (!comments || comments.length == 0) return '';

    // JS compiler only considers the last comment significant.
    let {pos, end} = comments[comments.length - 1];
    let comment = this.file.text.substring(pos, end);
    return Annotator.getJsDocAnnotation(comment);
  }

  // return empty string if comment is not JsDoc.
  static getJsDocAnnotation(comment: string): string {
    if (/^\/\*\*/.test(comment) && /\*\/$/.test(comment)) {
      return comment.slice(3, comment.length - 2);
    }
    return '';
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

  private visitTypeAlias(node: ts.TypeAliasDeclaration) {
    this.emit('/** @typedef {');
    this.visit(node.type);
    this.emit('} */\n');
    this.emit('var ');
    this.emit(node.name.getText());
    this.emit(';\n');
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
      this.writeTextFromOffset(lastEnd, child);
      this.visit(child);
      lastEnd = child.getEnd();
    }
    // Write any trailing text.
    this.writeRange(lastEnd, node.getEnd());
  }

  // Write a span of the input file as expressed by absolute offsets.
  // These offsets are found in attributes like node.getFullStart() and
  // node.getEnd().
  private writeRange(from: number, to: number) {
    // getSourceFile().getText() is wrong here because it the text of
    // the SourceFile node of the AST, which doesn't contain the comments
    // preceding that node.  Semantically these ranges are just offsets
    // into the original source file text, so slice from that.
    let text = this.file.text.slice(from, to);
    if (text) this.emit(text);
  }

  private writeTextBetween(node: ts.Node, to: ts.Node) {
    this.writeRange(node.getFullStart(), to.getFullStart());
  }

  private writeTextFromOffset(from: number, node: ts.Node) {
    let to = node.getFullStart();
    if (from == to) return;
    assert(to > from, 'Offset must not be smaller');
    this.writeRange(from, to);
  }

  private fail(msg: string) { throw new Error(msg); }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

function last<T>(elems: T[]): T {
  return elems.length ? elems[elems.length - 1] : null;
}

export function annotate(file: ts.SourceFile): string {
  return new Annotator().annotate(file);
}

// CLI entry point
if (require.main === module) {
  for (let path of process.argv.splice(2)) {
    let sourceText = ts.sys.readFile(path, 'utf-8');
    let sf = ts.createSourceFile(path, sourceText, ts.ScriptTarget.ES6, true);
    console.log(path + ':');
    console.log(annotate(sf));
  }
}
