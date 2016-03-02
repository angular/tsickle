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

// TypedProperty represents a property on a class we'd like Closure to
// know about.  We gather these up from multiple sources (field
// declarations, constructor parameters) and emit them all with type
// annotations in a function on the side (see emitPropertyDeclarations).
interface TypedProperty {
  name: string;
  type: ts.TypeNode;
  // extraTags holds extra Closure tags, such as @export.
  extraTags: string;
}

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
      case ts.SyntaxKind.ModuleDeclaration:
        if (node.flags & ts.NodeFlags.Ambient) {
          // An ambient module declaration only declares types for TypeScript's
          // benefit, so we want to skip all Sickle processing of it.
          this.writeRange(node.getFullStart(), node.getEnd());
          break;
        } else {
          this.writeNode(node);
        }
        break;
      case ts.SyntaxKind.InterfaceDeclaration:
        this.writeRange(node.getFullStart(), node.getEnd());
        if (node.flags & ts.NodeFlags.Ambient) {
          // It's a "declare interface ..."; write a Closure interface
          // declaration so we can @export all properties.
          let decl = <ts.InterfaceDeclaration>node;
          let className = decl.name.getText();
          let props: TypedProperty[] = [];
          for (let member of decl.members) {
            // Members can include things like index signatures, for e.g.
            //   interface Foo { [key: string]: number; }
            // For now, just die unless all the members are regular old
            // properties.
            if (member.kind != ts.SyntaxKind.PropertySignature) {
              this.fail(`unhandled member of kind ${ts.SyntaxKind[member.kind]}`);
            }
            let prop = <ts.PropertySignature>member;
            props.push({
              name: prop.name.getText(),
              type: prop.type,
              extraTags: '@export',
            });
          }
          // Note: be careful with this code!  It's easy to make something
          // that Closure will accept but then also have it silently rename
          // fields you intended to @export.
          // @record tells Closure that this type is structural (not sure
          // how well that works), while @struct makes it complain if you
          // accidentally add a field that isn't declared.
          this.emit('\n/** @record @struct */\n');
          this.emit(`function ${className}() {}\n`);
          this.emitPropertyDeclarations(className, props);
        }
        break;
      case ts.SyntaxKind.VariableDeclaration:
        this.maybeEmitJSDocType((<ts.VariableDeclaration>node).type);
        this.writeNode(node);
        break;
      case ts.SyntaxKind.ClassDeclaration:
        let classNode = <ts.ClassDeclaration>node;
        if (classNode.members.length > 0) {
          // We must visit all members individually, to strip out any
          // /** @export */ annotations that show up in the constructor
          // and to annotate methods.
          this.writeTextBetween(classNode, classNode.members[0]);
          for (let member of classNode.members) {
            this.visit(member);
          }
        } else {
          this.writeTextBetween(classNode, classNode.getLastToken());
        }
        this.emitTypeAnnotationsHelper(classNode);
        this.writeNode(classNode.getLastToken());
        break;
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
      case ts.SyntaxKind.Constructor:
        let ctor = <ts.ConstructorDeclaration>node;
        this.emitFunctionType(ctor);
        // Write the "constructor(...) {" bit, but iterate through any
        // parameters if given so that we can examine them more closely.
        let offset = ctor.getStart();
        if (ctor.parameters.length) {
          for (let param of ctor.parameters) {
            this.writeTextFromOffset(offset, param);
            this.visit(param);
            offset = param.getEnd();
          }
        }
        this.writeRange(offset, node.getEnd());
        break;
      case ts.SyntaxKind.ArrowFunction:
        if (this.options.untyped) {
          // In untyped mode, don't emit any type before the arrow function.
          // Works around issue #57.
          this.writeNode(node);
          break;
        }
      // Otherwise, fall through to the shared processing for function.
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.MethodDeclaration:
        let fnDecl = <ts.FunctionLikeDeclaration>node;

        if (!fnDecl.body) {
          // Functions are allowed to not have bodies in the presence
          // of overloads.  It's not clear how to translate these overloads
          // into Closure types, so skip them for now.
          this.writeNode(node);
          break;
        }

        this.emitFunctionType(fnDecl);
        this.writeTextFromOffset(fnDecl.getStart(), fnDecl.body);
        this.visit(fnDecl.body);
        break;
      case ts.SyntaxKind.TypeAliasDeclaration:
        this.visitTypeAlias(<ts.TypeAliasDeclaration>node);
        this.writeNode(node);
        break;
      case ts.SyntaxKind.EnumDeclaration:
        this.visitEnum(<ts.EnumDeclaration>node);
        break;
      case ts.SyntaxKind.TypeAssertionExpression:
        let typeAssertion = <ts.TypeAssertion>node;
        this.maybeEmitJSDocType(typeAssertion.type);
        this.emit('(');
        this.writeNode(node);
        this.emit(')');
        break;
      default:
        this.writeNode(node);
        break;
    }
    this.indent--;
  }

  private emitFunctionType(fnDecl: ts.FunctionLikeDeclaration) {
    // The first \n makes the output sometimes uglier than necessary,
    // but it's needed to work around
    // https://github.com/Microsoft/TypeScript/issues/6982
    this.emit('\n/**\n');
    let existingAnnotation = this.existingClosureAnnotation(fnDecl);
    if (existingAnnotation) {
      this.emit(' * ' + existingAnnotation + '\n');
    }
    // Parameters.
    if (fnDecl.parameters.length) {
      for (let param of fnDecl.parameters) {
        if (param.type) {
          let optional = param.initializer != null || param.questionToken != null;
          this.emit(' * @param {');
          this.emitType(param.type, optional);
          this.emit('} ');
          this.writeNode(param.name);
          this.emit('\n');
        }
      }
    }
    // Return type.
    if (fnDecl.type) {
      this.emit(' * @return {');
      this.emitType(fnDecl.type);
      this.emit('}\n');
    }
    this.emit(' */\n');
  }

  // emitTypeAnnotationsHelper produces a
  // _sickle_typeAnnotationsHelper() where none existed in the
  // original source.  It's necessary in the case where TypeScript
  // syntax specifies there are additional properties on the class,
  // because to declare these in Closure you must declare these in a
  // method somewhere.
  private emitTypeAnnotationsHelper(classDecl: ts.ClassDeclaration) {
    // Gather parameter properties from the constructor, if it exists.
    let props: TypedProperty[] = [];
    for (let member of classDecl.members) {
      switch (member.kind) {
        case ts.SyntaxKind.Constructor:
          let ctor = <ts.ConstructorDeclaration>member;
          for (let param of ctor.parameters) {
            if (param.flags & VISIBILITY_FLAGS) {
              props.push({
                name: param.name.getText(),
                type: param.type,
                extraTags: this.existingClosureAnnotation(param),
              });
            }
          }
          break;
        case ts.SyntaxKind.PropertyDeclaration:
          let prop = <ts.PropertyDeclaration>member;
          if (!(member.flags & ts.NodeFlags.Static)) {
            props.push({
              name: prop.name.getText(),
              type: prop.type,
              extraTags: this.existingClosureAnnotation(prop),
            });
          }
          break;
        default:
          break;
      }
    }

    if (props.length == 0) {
      // There are no members so we don't need to emit any type
      // annotations helper.
      return;
    }

    this.emit('\n\n');
    this.emit('  static _sickle_typeAnnotationsHelper() {\n');
    this.emitPropertyDeclarations(classDecl.name.text, props);
    this.emit('  }\n');
  }

  private emitPropertyDeclarations(className: string, props: TypedProperty[]) {
    for (let prop of props) {
      let extraTags = prop.extraTags || '';
      if (extraTags) {
        extraTags += '\n';
      }
      this.maybeEmitJSDocType(prop.type, extraTags + '@type');
      this.emit(`\n${className}.prototype.${prop.name};\n`);
    }
  }

  /**
   * Returns empty string if there is no existing annotation.
   */
  private existingClosureAnnotation(node: ts.Node) {
    let text = node.getFullText();
    let comments = ts.getLeadingCommentRanges(text, 0);

    if (!comments || comments.length == 0) return '';

    // JS compiler only considers the last comment significant.
    let {pos, end} = comments[comments.length - 1];
    let comment = text.substring(pos, end);
    return Annotator.getJsDocAnnotation(comment).trim();
  }

  // return empty string if comment is not JsDoc.
  static getJsDocAnnotation(comment: string): string {
    if (/^\/\*\*/.test(comment) && /\*\/$/.test(comment)) {
      return comment.slice(3, comment.length - 2);
    }
    return '';
  }

  private maybeEmitJSDocType(type: ts.TypeNode, jsDocTag?: string) {
    if (!type && !this.options.untyped) return;
    this.emit(' /**');
    if (jsDocTag) {
      this.emit(' ');
      this.emit(jsDocTag);
      this.emit(' {');
    }
    this.emitType(type);
    if (jsDocTag) {
      this.emit('}');
    }
    this.emit(' */');
  }

  private emitType(type: ts.TypeNode, optional?: boolean) {
    if (this.options.untyped) {
      this.emit(' ?');
    } else {
      this.visit(type);
    }
    if (optional) {
      this.emit('=');
    }
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

  private visitEnum(node: ts.EnumDeclaration) {
    if (!this.options.untyped) this.emit('/** @typedef {number} */\n');
    this.writeNode(node);
    this.emit('\n');
    let i = 0;
    for (let member of node.members) {
      if (!this.options.untyped) this.emit(`/** @type {${node.name.getText()}} */\n`);
      this.emit(`(<any>${node.name.getText()}).${member.name.getText()} = `);
      if (member.initializer) {
        this.visit(member.initializer);
      } else {
        this.emit(String(i));
        i++;
      }
      this.emit(';\n');
    }
  }

  private writeNode(node: ts.Node, skipComments: boolean = false) {
    if (node.getChildCount() == 0) {
      // Directly write complete tokens.
      if (skipComments) {
        // To skip comments, we skip all whitespace/comments preceding
        // the node.  But if there was anything skipped we should emit
        // a newline in its place so that the node remains separated
        // from the previous node.  TODO: don't skip anything here if
        // there wasn't any comment.
        if (node.getFullStart() < node.getStart()) {
          this.emit('\n');
        }
        this.emit(node.getText());
      } else {
        this.emit(node.getFullText());
      }
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
