import * as ts from 'typescript';

export interface SickleOptions {
  // If true, convert every type to the Closure {?} type, which means
  // "don't check types".
  untyped?: boolean;
}

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
  // The node currently being visited by visit().
  // This is only used in error messages.
  private currentNode: ts.Node;

  constructor(private options: SickleOptions) { this.indent = 0; }

  annotate(file: ts.SourceFile): string {
    this.output = [];
    this.file = file;
    this.visit(file);
    this.assert(this.indent == 0, 'visit() failed to track nesting');
    return this.output.join('');
  }

  private emit(str: string) { this.output.push(str); }

  private logWithIndent(message: string) {
    let prefix = new Array(this.indent + 1).join('| ');
    console.log(prefix + message);
  }

  private visit(node: ts.Node) {
    this.currentNode = node;
    // this.logWithIndent('node: ' + (<any>ts).SyntaxKind[node.kind]);
    this.indent++;
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
      case ts.SyntaxKind.PublicKeyword:
      case ts.SyntaxKind.PrivateKeyword:
        // The "public"/"private" keywords are encountered in two places:
        // 1) In class fields (which don't appear in the transformed output).
        // 2) In "parameter properties", e.g.
        //      constructor(/** @export */ public foo: string).
        // In case 2 it's important to not emit that JSDoc in the generated
        // constructor, as this is illegal for Closure.  It's safe to just
        // always skip comments preceding the 'public' keyword.
        // See test_files/parameter_properties.ts.
        this.writeNode(node, /* skipComments */ true);
        break;
      case ts.SyntaxKind.Constructor: {
        let ctor = <ts.ConstructorDeclaration>node;
        // Write the "constructor(...) {" bit, but iterate through any
        // parameters if given so that we can examine them more closely.
        let offset = ctor.getFullStart();
        if (ctor.parameters.length) {
          for (let param of ctor.parameters) {
            this.writeTextFromOffset(offset, param);
            this.visit(param);
            offset = param.getEnd();
          }
        }
        offset = this.writeTextFromOffset(offset, ctor.body);

        if (ctor.body.statements.length) {
          // Insert before the first code in the ctor.
          offset = this.writeTextFromOffset(offset, ctor.body.statements[0]);
        } else {
          // Empty ctor - just insert before the end of it.
          offset = this.writeTextFromOffset(offset, ctor.body.getLastToken());
        }

        let paramProps = ctor.parameters.filter((p) => !!(p.flags & VISIBILITY_FLAGS));
        this.emitStubDeclarations(<ts.ClassLikeDeclaration>ctor.parent, paramProps);

        this.writeRange(offset, ctor.body.getEnd());
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
        this.writeNode(node);
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
    let nonStaticProps = <ts.PropertyDeclaration[]>(classDecl.members.filter((e) => {
      let isStatic = (e.flags & ts.NodeFlags.Static) !== 0;
      let isProperty = e.kind === ts.SyntaxKind.PropertyDeclaration;
      return !isStatic && isProperty;
    }));
    nonStaticProps.forEach((p) => this.visitProperty(p));
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
    let text = p.getFullText();
    let comments = ts.getLeadingCommentRanges(text, 0);

    if (!comments || comments.length == 0) return '';

    // JS compiler only considers the last comment significant.
    let {pos, end} = comments[comments.length - 1];
    let comment = text.substring(pos, end);
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
    if (!type && !this.options.untyped) return;
    this.emit(' /**');
    if (jsDocTag) {
      this.emit(' ');
      this.emit(jsDocTag);
      this.emit(' {');
    }
    if (this.options.untyped) {
      this.emit(' ?');
    } else {
      this.visit(type);
    }
    if (jsDocTag) {
      this.emit('}');
    }
    this.emit(' */');
  }

  private visitTypeAlias(node: ts.TypeAliasDeclaration) {
    if (this.options.untyped) return;
    // Write a Closure typedef, which involves an unused "var" declaration.
    this.emit('/** @typedef {');
    this.visit(node.type);
    this.emit('} */\n');
    this.emit('var ');
    this.emit(node.name.getText());
    this.emit(': void;\n');
  }

  private writeNode(node: ts.Node, skipComments: boolean = false) {
    if (node.getChildCount() == 0) {
      // Directly write complete tokens.
      this.emit(skipComments ? node.getText() : node.getFullText());
      return;
    }
    if (skipComments) {
      this.fail('skipComments unimplemented for complex Nodes');
    }
    let lastEnd = node.getFullStart();
    for (let child of node.getChildren()) {
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
  private writeRange(from: number, to: number): number {
    // getSourceFile().getText() is wrong here because it the text of
    // the SourceFile node of the AST, which doesn't contain the comments
    // preceding that node.  Semantically these ranges are just offsets
    // into the original source file text, so slice from that.
    let text = this.file.text.slice(from, to);
    if (text) this.emit(text);
    return to;
  }

  private writeTextBetween(node: ts.Node, to: ts.Node): number {
    return this.writeRange(node.getFullStart(), to.getFullStart());
  }

  private writeTextFromOffset(from: number, node: ts.Node): number {
    let to = node.getFullStart();
    if (from == to) return to;
    this.assert(to > from, `Offset must not be smaller; ${to} vs ${from}`);
    return this.writeRange(from, to);
  }

  private fail(msg: string) {
    let offset = this.currentNode.getFullStart();
    let {line, character} = this.file.getLineAndCharacterOfPosition(offset);
    throw new Error(`near node starting at ${line+1}:${character+1}: ${msg}`);
  }

  private assert(condition: boolean, msg: string) {
    if (!condition) this.fail(msg);
  }
}

function last<T>(elems: T[]): T {
  return elems.length ? elems[elems.length - 1] : null;
}

export function annotate(file: ts.SourceFile, options: SickleOptions = {}): string {
  let fullOptions: SickleOptions = {
    untyped: options.untyped || false,
  };
  return new Annotator(fullOptions).annotate(file);
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
