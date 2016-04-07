import * as ts from 'typescript';

export interface Options {
  // If true, convert every type to the Closure {?} type, which means
  // "don't check types".
  untyped?: boolean;
}

export interface Output {
  // The TypeScript source with Closure annotations inserted.
  output: string;
  // Generated externs declarations, if any.
  externs: string;
  // Error messages, if any.
  diagnostics: ts.Diagnostic[];
}

/**
 * Symbols that are already declared as externs in Closure, that should
 * be avoided by sickle's "declare ..." => externs.js conversion.
 */
export let closureExternsBlacklist: string[] = [
  'exports',
  'global',
  'module',
  'WorkerGlobalScope',
  'Symbol',
];

export function formatDiagnostics(diags: ts.Diagnostic[]): string {
  return diags
      .map((d) => {
        let res = ts.DiagnosticCategory[d.category];
        if (d.file) {
          res += ' at ' + d.file.fileName + ':';
          let {line, character} = d.file.getLineAndCharacterOfPosition(d.start);
          res += (line + 1) + ':' + (character + 1) + ':';
        }
        res += ' ' + d.messageText;
        return res;
      })
      .join('\n');
}

/**
 * TypeScript has an API for JSDoc already, but it's not exposed.
 * https://github.com/Microsoft/TypeScript/issues/7393
 * For now we create types that are similar to theirs so that migrating
 * to their API will be easier.  See e.g. ts.JSDocTag and ts.JSDocComment.
 */
export interface JSDocTag {
  // tagName is e.g. "param" in an @param declaration.  It's absent
  // for the plain text documentation that occurs before any @foo lines.
  tagName?: string;
  // parameterName is the the name of the function parameter, e.g. "foo"
  // in
  //   @param foo The foo param.
  parameterName?: string;
  type?: ts.TypeNode;
  // optional is true for optional function parameters.
  optional?: boolean;
  // restParam is true for "...x: foo[]" function parameters.
  restParam?: boolean;
  // notNull is true for binding parameters, which require require
  // non-null arguments on the Closure side.  Can likely remove this
  // once TypeScript nullable types are available.
  notNull?: boolean;
  text?: string;
}

export interface JSDocComment { tags: JSDocTag[]; }

/**
 * getJSDocAnnotation parses JSDoc out of a comment string.
 * Returns null if comment is not JSDoc.
 */
export function getJSDocAnnotation(comment: string): JSDocComment {
  // TODO(evanm): this is a pile of hacky regexes for now, because we
  // would rather use the better TypeScript implementation of JSDoc
  // parsing.  https://github.com/Microsoft/TypeScript/issues/7393
  let match = comment.match(/^\/\*\*([\s\S]*?)\*\/$/);
  if (!match) return null;
  comment = match[1].trim();
  // Strip all the " * " bits from the front of each line.
  comment = comment.replace(/^\s*\* /gm, '');
  let lines = comment.split('\n');
  let tags: JSDocTag[] = [];
  for (let line of lines) {
    match = line.match(/^@(\S+) *(.*)/);
    if (match) {
      let [_, tagName, text] = match;
      if (tagName === 'type') {
        throw new Error('@type annotations are not allowed');
      }
      if ((tagName === 'param' || tagName === 'return') && text[0] === '{') {
        throw new Error('type annotations (using {...}) are not allowed');
      }

      // Grab the parameter name from @param tags.
      let parameterName: string;
      if (tagName === 'param') {
        match = text.match(/^(\S+) ?(.*)/);
        if (match) [_, parameterName, text] = match;
      }

      let tag: JSDocTag = {tagName};
      if (parameterName) tag.parameterName = parameterName;
      if (text) tag.text = text;
      tags.push(tag);
    } else {
      // Text without a preceding @tag on it is either the plain text
      // documentation or a continuation of a previous tag.
      if (tags.length === 0) {
        tags.push({text: line.trim()});
      } else {
        tags[tags.length - 1].text += ' ' + line.trim();
      }
    }
  }
  return {tags};
}

/**
 * A Rewriter manages iterating through a ts.SourceFile, copying input
 * to output while letting the subclass potentially alter some nodes
 * along the way by implementing maybeProcess().
 */
abstract class Rewriter {
  protected output: string[] = [];
  /**
   * The current level of recursion through TypeScript Nodes.  Used in formatting internal debug
   * print statements.
   */
  private indent: number = 0;

  constructor(protected file: ts.SourceFile) {}

  getOutput(): string {
    if (this.indent !== 0) {
      throw new Error('visit() failed to track nesting');
    }
    return this.output.join('');
  }

  /**
   * visit traverses a Node, recursively writing all nodes not handled by this.maybeProcess.
   */
  visit(node: ts.Node) {
    // this.logWithIndent('node: ' + ts.SyntaxKind[node.kind]);
    this.indent++;
    if (!this.maybeProcess(node)) this.writeNode(node);
    this.indent--;
  }

  /**
   * maybeProcess lets subclasses optionally processes a node.
   *
   * @return True if the node has been handled and doesn't need to be traversed;
   *    false to have the node written and its children recursively visited.
   */
  protected abstract maybeProcess(node: ts.Node): boolean;

  /** writeNode writes a ts.Node, calling this.visit() on its children. */
  writeNode(node: ts.Node, skipComments = false) {
    if (node.getChildCount() === 0) {
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
      throw new Error('skipComments unimplemented for complex Nodes');
    }
    let lastEnd = node.getFullStart();
    for (let child of node.getChildren()) {
      this.writeRange(lastEnd, child.getFullStart());
      this.visit(child);
      lastEnd = child.getEnd();
    }
    // Write any trailing text.
    this.writeRange(lastEnd, node.getEnd());
  }

  // Write a span of the input file as expressed by absolute offsets.
  // These offsets are found in attributes like node.getFullStart() and
  // node.getEnd().
  writeRange(from: number, to: number) {
    // getSourceFile().getText() is wrong here because it has the text of
    // the SourceFile node of the AST, which doesn't contain the comments
    // preceding that node.  Semantically these ranges are just offsets
    // into the original source file text, so slice from that.
    let text = this.file.text.slice(from, to);
    if (text) this.emit(text);
  }

  emit(str: string) { this.output.push(str); }

  /* tslint:disable: no-unused-variable */
  logWithIndent(message: string) {
    /* tslint:enable: no-unused-variable */
    let prefix = new Array(this.indent + 1).join('| ');
    console.log(prefix + message);
  }
}


const VISIBILITY_FLAGS = ts.NodeFlags.Private | ts.NodeFlags.Protected | ts.NodeFlags.Public;

/**
 * A source processor that takes TypeScript code and annotates the output with Closure-style JSDoc
 * comments.
 */
class Annotator extends Rewriter {
  /** Generated externs.js, if any. */
  private externsOutput: string[] = [];
  /** Warnings/errors found while examining the code. */
  private diagnostics: ts.Diagnostic[] = [];
  /** Exported symbol names that have been generated by expanding an "export * from ...". */
  private generatedExports: {[symbol: string]: boolean} = {};
  /** The set of namespaces that have already been emitted (through classes or modules). */
  private emittedNamespaces: ts.Map<boolean> = {};

  constructor(private program: ts.Program, file: ts.SourceFile, private options: Options) {
    super(file);
  }

  annotate(): Output {
    this.visit(this.file);
    let externs: string = null;
    if (this.externsOutput.length > 0) {
      externs = '/** @externs */\n' + this.externsOutput.join('');
    }
    return {
      output: this.getOutput(),
      externs,
      diagnostics: this.diagnostics,
    };
  }

  /**
   * Examines a ts.Node and decides whether to do special processing of it for output.
   *
   * @return True if the ts.Node has been handled, false if we should
   *     emit it as is and visit its children.
   */
  maybeProcess(node: ts.Node): boolean {
    if (node.flags & ts.NodeFlags.Ambient) {
      this.visitExterns(node);
      // An ambient declaration declares types for TypeScript's benefit, so we want to skip Sickle
      // conversion of its contents.
      this.writeRange(node.getFullStart(), node.getEnd());
      return true;
    }

    switch (node.kind) {
      case ts.SyntaxKind.ExportDeclaration:
        let exportDecl = <ts.ExportDeclaration>node;
        if (!exportDecl.exportClause && exportDecl.moduleSpecifier) {
          // It's an "export * from ..." statement.
          // Rewrite it to re-export each exported symbol directly.
          let exports = this.expandSymbolsFromExportStar(exportDecl);
          this.writeRange(exportDecl.getFullStart(), exportDecl.getStart());
          this.emit(`export {${exports.join(',')}} from`);
          this.writeRange(exportDecl.moduleSpecifier.getFullStart(), node.getEnd());
          return true;
        }
        return false;
      case ts.SyntaxKind.InterfaceDeclaration:
        this.writeRange(node.getFullStart(), node.getEnd());
        return true;
      case ts.SyntaxKind.VariableDeclaration:
        this.maybeEmitJSDocType((<ts.VariableDeclaration>node).type);
        return false;
      case ts.SyntaxKind.ClassDeclaration:
        let classNode = <ts.ClassDeclaration>node;
        if (classNode.members.length > 0) {
          // We must visit all members individually, to strip out any
          // /** @export */ annotations that show up in the constructor
          // and to annotate methods.
          this.writeRange(classNode.getFullStart(), classNode.members[0].getFullStart());
          for (let member of classNode.members) {
            this.visit(member);
          }
        } else {
          this.writeRange(classNode.getFullStart(), classNode.getLastToken().getFullStart());
        }
        this.emitTypeAnnotationsHelper(classNode);
        this.writeNode(classNode.getLastToken());
        return true;
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
        return true;
      case ts.SyntaxKind.Constructor:
        let ctor = <ts.ConstructorDeclaration>node;
        this.emitFunctionType(ctor);
        // Write the "constructor(...) {" bit, but iterate through any
        // parameters if given so that we can examine them more closely.
        let offset = ctor.getStart();
        if (ctor.parameters.length) {
          for (let param of ctor.parameters) {
            this.writeRange(offset, param.getFullStart());
            this.visit(param);
            offset = param.getEnd();
          }
        }
        this.writeRange(offset, node.getEnd());
        return true;
      case ts.SyntaxKind.ArrowFunction:
        if (this.options.untyped) {
          // In untyped mode, don't emit any type before the arrow function.
          // Works around issue #57.
          return false;
        }
      // Otherwise, fall through to the shared processing for function.
      /* tslint:disable: no-switch-case-fall-through */
      case ts.SyntaxKind.FunctionDeclaration:
      /* tslint:enable: no-switch-case-fall-through */
      case ts.SyntaxKind.MethodDeclaration:
        let fnDecl = <ts.FunctionLikeDeclaration>node;

        if (!fnDecl.body) {
          // Functions are allowed to not have bodies in the presence
          // of overloads.  It's not clear how to translate these overloads
          // into Closure types, so skip them for now.
          return false;
        }

        this.emitFunctionType(fnDecl);
        this.writeRange(fnDecl.getStart(), fnDecl.body.getFullStart());
        this.visit(fnDecl.body);
        return true;
      case ts.SyntaxKind.TypeAliasDeclaration:
        this.visitTypeAlias(<ts.TypeAliasDeclaration>node);
        this.writeNode(node);
        return true;
      case ts.SyntaxKind.EnumDeclaration:
        this.visitEnum(<ts.EnumDeclaration>node);
        return true;
      case ts.SyntaxKind.TypeAssertionExpression:
        let typeAssertion = <ts.TypeAssertion>node;
        this.maybeEmitJSDocType(typeAssertion.type);
        // When TypeScript emits JS, it removes one layer of "redundant"
        // parens, but we need them for the Closure type assertion.  Work
        // around this by using two parens.  See test_files/coerce.*.
        this.emit('((');
        this.writeNode(node);
        this.emit('))');
        return true;
      default:
        break;
    }
    return false;
  }

  private expandSymbolsFromExportStar(exportDecl: ts.ExportDeclaration): string[] {
    let typeChecker = this.program.getTypeChecker();

    // Gather the names of local exports, to avoid reexporting any
    // names that are already locally exported.
    // To find symbols declared like
    //   export {foo} from ...
    // we must also query for "Alias", but that unfortunately also brings in
    //   import {foo} from ...
    // so the latter is filtered below.
    let locals =
        typeChecker.getSymbolsInScope(this.file, ts.SymbolFlags.Export | ts.SymbolFlags.Alias);
    let localSet: {[name: string]: boolean} = {};
    for (let local of locals) {
      if (local.declarations.some(d => d.kind === ts.SyntaxKind.ImportSpecifier)) {
        continue;
      }
      localSet[local.name] = true;
    }

    // Expand the export list, then filter it to the symbols we want
    // to reexport
    let exports =
        typeChecker.getExportsOfModule(typeChecker.getSymbolAtLocation(exportDecl.moduleSpecifier));
    let reexports: {[name: string]: boolean} = {};
    for (let sym of exports) {
      let name = sym.name;
      if (localSet.hasOwnProperty(name)) {
        // This name is shadowed by a local definition, such as:
        // - export var foo ...
        // - export {foo} from ...
        continue;
      }
      if (this.generatedExports.hasOwnProperty(name)) {
        // Already exported via an earlier expansion of an "export * from ...".
        continue;
      }
      this.generatedExports[name] = true;
      reexports[name] = true;
    }

    return Object.keys(reexports);
  }

  private emitFunctionType(fnDecl: ts.FunctionLikeDeclaration, extraTags: JSDocTag[] = []) {
    // Construct the JSDoc comment by reading the existing JSDoc, if
    // any, and merging it with the known types of the function
    // parameters and return type.
    let jsDoc = this.getJSDoc(fnDecl) || {tags: []};
    let newDoc: JSDocComment = {tags: extraTags};

    // Copy all the tags other than @param/@return into the new
    // comment without any change; @param/@return are handled later.
    for (let tag of jsDoc.tags) {
      if (tag.tagName === 'param' || tag.tagName === 'return') continue;
      newDoc.tags.push(tag);
    }

    // Parameters.
    if (fnDecl.parameters.length) {
      let paramIdx = 0;
      for (let param of fnDecl.parameters) {
        let newTag: JSDocTag = {
          tagName: 'param',
          type: param.type,
          optional: param.initializer !== undefined || param.questionToken !== undefined,
        };
        switch (param.name.kind) {
          case ts.SyntaxKind.ArrayBindingPattern:
          case ts.SyntaxKind.ObjectBindingPattern:
            // Produce unique names for synthetic parameter names.
            newTag.parameterName = `param${paramIdx++}`;
            newTag.notNull = true;
            break;
          case ts.SyntaxKind.Identifier:
            newTag.parameterName = (<ts.Identifier>param.name).text;
            // Search for this parameter in the JSDoc @params.
            for (let {tagName, parameterName, text} of jsDoc.tags) {
              if (tagName === 'param' && parameterName === newTag.parameterName) {
                newTag.text = text;
                break;
              }
            }
            break;
          default:
            this.errorUnimplementedKind(param.name, 'parameter name');
        }

        if (param.dotDotDotToken !== undefined) {
          newTag.restParam = true;
          // In TypeScript you write "...x: number[]", but in Closure
          // you don't write the array: "@param {...number} x".  Unwrap
          // the array wrapper.
          // TODO(evanm): we should use the TypeScript
          // TypeChecker-computed Type, not the syntactical type,
          // so that we don't need to worry about T[] vs Array<T> here
          // or whether we got the correct 'Array' below.
          if (param.type) {
            if (param.type.kind === ts.SyntaxKind.ArrayType) {
              let arrayType = <ts.ArrayTypeNode>param.type;
              newTag.type = arrayType.elementType;
            } else if (param.type.kind === ts.SyntaxKind.TypeReference) {
              let refType = <ts.TypeReferenceNode>param.type;
              if (refType.typeName.getText() !== 'Array') {
                this.error(refType, 'expected array type for rest param');
              }
              newTag.type = refType.typeArguments[0];
            } else {
              this.error(param, 'expected array type for rest param');
            }
          }
        }
        newDoc.tags.push(newTag);
      }
    }

    // Return type.
    if (fnDecl.type) {
      let returnDoc: string;
      for (let {tagName, text} of jsDoc.tags) {
        if (tagName === 'return') {
          returnDoc = text;
          break;
        }
      }
      newDoc.tags.push({
        tagName: 'return',
        type: fnDecl.type,
        text: returnDoc,
      });
    }

    // The first \n makes the output sometimes uglier than necessary,
    // but it's needed to work around
    // https://github.com/Microsoft/TypeScript/issues/6982
    this.emit('\n/**\n');
    for (let tag of newDoc.tags) {
      this.emit(' * ');
      if (tag.tagName) {
        this.emit(`@${tag.tagName}`);
      }
      if (tag.type) {
        this.emit(' {');
        if (tag.restParam) {
          this.emit('...');
        }
        if (tag.notNull && !this.options.untyped) {
          this.emit('!');
        }
        this.emit(this.typeToClosure(tag.type));
        if (tag.optional) {
          this.emit('=');
        }
        this.emit('}');
      }
      if (tag.parameterName) {
        this.emit(' ' + tag.parameterName);
      }
      if (tag.text) {
        this.emit(' ' + tag.text);
      }
      this.emit('\n');
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
    let paramProps: ts.ParameterDeclaration[] = [];
    let ctors = classDecl.members.filter((e) => e.kind === ts.SyntaxKind.Constructor);
    if (ctors && ctors.length > 0) {
      let ctor = <ts.ConstructorDeclaration>ctors[0];
      paramProps = ctor.parameters.filter((p) => !!(p.flags & VISIBILITY_FLAGS));
    }

    // Gather other non-static properties on the class.
    let nonStaticProps = <ts.PropertyDeclaration[]>(classDecl.members.filter((e) => {
      let isStatic = (e.flags & ts.NodeFlags.Static) !== 0;
      let isProperty = e.kind === ts.SyntaxKind.PropertyDeclaration;
      return !isStatic && isProperty;
    }));

    if (nonStaticProps.length === 0 && paramProps.length === 0) {
      // There are no members so we don't need to emit any type
      // annotations helper.
      return;
    }

    this.emit('\n\n  static _sickle_typeAnnotationsHelper() {\n');
    nonStaticProps.forEach((p) => this.visitProperty(classDecl.name.text, p));
    paramProps.forEach((p) => this.visitProperty(classDecl.name.text, p));
    this.emit('  }\n');
  }

  private visitProperty(className: string, p: ts.PropertyDeclaration|ts.ParameterDeclaration) {
    let jsDoc = this.getJSDoc(p) || {tags: []};
    let existingAnnotation = '';
    for (let {tagName, text} of jsDoc.tags) {
      if (tagName) {
        existingAnnotation += `@${tagName}\n`;
      } else {
        existingAnnotation += `${text}\n`;
      }
    }
    this.maybeEmitJSDocType(p.type, existingAnnotation);
    this.emit(`\n    ${className}.prototype.${p.name.getText()};\n`);
  }

  /**
   * Returns null if there is no existing comment.
   */
  private getJSDoc(node: ts.Node): JSDocComment {
    let text = node.getFullText();
    let comments = ts.getLeadingCommentRanges(text, 0);

    if (!comments || comments.length === 0) return null;

    // JS compiler only considers the last comment significant.
    let {pos, end} = comments[comments.length - 1];
    let comment = text.substring(pos, end);
    try {
      return getJSDocAnnotation(comment);
    } catch (e) {
      this.diagnostics.push({
        file: this.file,
        start: node.getFullStart() + pos,
        length: end - pos,
        messageText: e.message,
        category: ts.DiagnosticCategory.Error,
        code: undefined,
      });
      return null;
    }
  }

  private visitExterns(node: ts.Node, namespace: string[] = []) {
    let originalOutput = this.output;
    this.output = this.externsOutput;
    switch (node.kind) {
      case ts.SyntaxKind.ModuleDeclaration:
        let decl = <ts.ModuleDeclaration>node;
        switch (decl.name.kind) {
          case ts.SyntaxKind.Identifier:
            // E.g. "declare namespace foo {"
            namespace = namespace.concat(decl.name.text);
            let nsName = namespace.join('.');
            if (!this.emittedNamespaces.hasOwnProperty(nsName)) {
              this.emit('/** @const */\n');
              if (namespace.length > 1) {
                this.emit(`${namespace.join('.')} = {};\n`);
              } else {
                this.emit(`var ${namespace} = {};\n`);
              }
            }
            this.emittedNamespaces[nsName] = true;
            this.visitExterns(decl.body, namespace);
            break;
          case ts.SyntaxKind.StringLiteral:
            // E.g. "declare module 'foo' {" (note the quotes).
            // Skip it.
            break;
          default:
            this.errorUnimplementedKind(decl.name, 'externs generation of namespace');
        }
        break;
      case ts.SyntaxKind.ModuleBlock:
        let block = <ts.ModuleBlock>node;
        for (let stmt of block.statements) {
          this.visitExterns(stmt, namespace);
        }
        break;
      case ts.SyntaxKind.ClassDeclaration:
      case ts.SyntaxKind.InterfaceDeclaration:
        this.writeExternsType(<ts.InterfaceDeclaration|ts.ClassDeclaration>node, namespace);
        break;
      case ts.SyntaxKind.FunctionDeclaration:
        let f = <ts.FunctionDeclaration>node;
        this.emitFunctionType(f);
        let params = f.parameters.map((p) => p.name.getText());
        this.writeExternsFunction(f.name.getText(), params.join(', '), namespace);
        break;
      case ts.SyntaxKind.VariableStatement:
        for (let decl of (<ts.VariableStatement>node).declarationList.declarations) {
          this.writeExternsVariable(decl, namespace);
        }
        break;
      default:
        this.errorUnimplementedKind(node, 'externs generation');
        break;
    }
    this.output = originalOutput;
  }

  private writeExternsType(decl: ts.InterfaceDeclaration|ts.ClassDeclaration, namespace: string[]) {
    let typeName = namespace.concat([decl.name.getText()]).join('.');
    this.emittedNamespaces[typeName] = true;
    if (closureExternsBlacklist.indexOf(typeName) >= 0) return;
    this.emittedNamespaces[typeName] = true;

    let paramNames = '';
    if (decl.kind === ts.SyntaxKind.ClassDeclaration) {
      let ctors =
          (<ts.ClassDeclaration>decl).members.filter((m) => m.kind === ts.SyntaxKind.Constructor);
      if (ctors.length) {
        if (ctors.length > 1) {
          this.error(ctors[1], 'multiple constructor signatures in declarations');
        }
        let ctor = <ts.ConstructorDeclaration>ctors[0];
        this.emitFunctionType(ctor, [{tagName: 'constructor'}, {tagName: 'struct'}]);
        paramNames = ctor.parameters.map((p) => p.name.getText()).join(', ');
      } else {
        this.emit('/** @constructor @struct */\n');
      }
    } else {
      this.emit('/** @record @struct */\n');
    }

    this.writeExternsFunction(decl.name.getText(), paramNames, namespace);

    for (let member of decl.members) {
      switch (member.kind) {
        case ts.SyntaxKind.PropertySignature:
        case ts.SyntaxKind.PropertyDeclaration:
          let prop = <ts.PropertySignature>member;
          this.maybeEmitJSDocType(prop.type);
          this.emit(`\n${typeName}.prototype.${prop.name.getText()};\n`);
          break;
        case ts.SyntaxKind.MethodDeclaration:
          let m = <ts.MethodDeclaration>member;
          this.emitFunctionType(m);
          this.emit(
              `${typeName}.prototype.${m.name.getText()} = ` +
              `function(${m.parameters.map((p) => p.name.getText()).join(', ')}) {};\n`);
          break;
        case ts.SyntaxKind.Constructor:
          break;  // Handled above.
        default:
          // Members can include things like index signatures, for e.g.
          //   interface Foo { [key: string]: number; }
          // For now, just die unless all the members are regular old
          // properties.
          this.errorUnimplementedKind(member, 'externs for interface');
      }
    }
  }

  private writeExternsVariable(decl: ts.VariableDeclaration, namespace: string[]) {
    if (decl.name.kind === ts.SyntaxKind.Identifier) {
      let identifier = <ts.Identifier>decl.name;
      let qualifiedName = namespace.concat([identifier.text]).join('.');
      if (closureExternsBlacklist.indexOf(qualifiedName) >= 0) return;
      this.maybeEmitJSDocType(decl.type);
      if (namespace.length > 0) {
        this.emit(`\n${qualifiedName};\n`);
      } else {
        this.emit(`\nvar ${qualifiedName};\n`);
      }
    } else {
      this.errorUnimplementedKind(decl.name, 'externs for variable');
    }
  }

  private writeExternsFunction(name: string, params: string, namespace: string[]) {
    if (namespace.length > 0) {
      name = namespace.concat([name]).join('.');
      this.emit(`${name} = function(${params}) {};\n`);
    } else {
      this.emit(`function ${name}(${params}) {}\n`);
    }
  }

  private maybeEmitJSDocType(type: ts.TypeNode, additionalDocTag?: string) {
    if (!type && !this.options.untyped) return;
    this.emit(' /**');
    if (additionalDocTag) {
      this.emit(' ' + additionalDocTag);
    }
    this.emit(` @type {${this.typeToClosure(type)}} */`);
  }

  /**
   * Convert a TypeScript TypeNode into the equivalent Closure type.
   * Important conversions include:
   * - any => ?
   * - foo[] => Array<foo>
   */
  private typeToClosure(node: ts.TypeNode): string {
    if (this.options.untyped || !node) {
      return '?';
    }

    switch (node.kind) {
      case ts.SyntaxKind.AnyKeyword:
        return '?';
      case ts.SyntaxKind.BooleanKeyword:
      case ts.SyntaxKind.VoidKeyword:
      case ts.SyntaxKind.NumberKeyword:
      case ts.SyntaxKind.StringKeyword:
        return node.getText();
      case ts.SyntaxKind.TypeReference:
        // This is e.g. "Object" or "Array<foo>".
        let typeRef = <ts.TypeReferenceNode>node;
        let type = typeRef.typeName.getText();
        if (typeRef.typeArguments) {
          let args = typeRef.typeArguments.map(t => this.typeToClosure(t)).join(',');
          return `${type}<${args}>`;
        }
        return type;
      case ts.SyntaxKind.TypeLiteral:
        // Anonymous type literal, e.g. {a:number, b:string}.
        let typeLiteral = <ts.TypeLiteralNode>node;

        // Special case 1: an ordinary indexable, e.g. {[key:string]:number}.
        // In that case we want to emit Object<string, number>.
        if (typeLiteral.members.length === 1 &&
            typeLiteral.members[0].kind === ts.SyntaxKind.IndexSignature) {
          let indexSig = <ts.IndexSignatureDeclaration>typeLiteral.members[0];
          let keyType: string;
          if (indexSig.parameters.length !== 1) {
            this.error(
                indexSig,
                `index signature expected 1 parameters, got ${indexSig.parameters.length}`);
            keyType = '?';
          } else {
            keyType = this.typeToClosure(indexSig.parameters[0].type);
          }
          let valType = this.typeToClosure(indexSig.type);
          return `Object<${keyType},${valType}>`;
        }

        // Special case 2: a collection of named fields.
        // Emit {a:string, b:number}, etc.
        if (typeLiteral.members.every(m => m.kind === ts.SyntaxKind.PropertySignature)) {
          let memberTypes: string[] = [];
          for (let member of typeLiteral.members) {
            let prop = <ts.PropertySignature>member;
            let optional = prop.questionToken !== undefined;
            let type = this.typeToClosure(prop.type);
            if (optional) type = `(${type}|undefined)`;
            memberTypes.push(`${prop.name.getText()}: ${type}`);
          }
          return `{${memberTypes.join(', ')}}`;
        }

        // Otherwise it's a mixture of the above or something else complicated;
        // give up.
        return '?';
      case ts.SyntaxKind.ArrayType:
        let arrayType = <ts.ArrayTypeNode>node;
        return `Array<${this.typeToClosure(arrayType.elementType)}>`;
      case ts.SyntaxKind.UnionType:
        let unionType = <ts.UnionTypeNode>node;
        let types = unionType.types.map(t => this.typeToClosure(t)).join('|');
        return `(${types})`;
      case ts.SyntaxKind.ParenthesizedType:
        let parenType = <ts.ParenthesizedTypeNode>node;
        return `(${this.typeToClosure(parenType.type)})`;
      case ts.SyntaxKind.FunctionType:
        let funcType = <ts.FunctionTypeNode>node;
        let params = funcType.parameters.map(p => this.typeToClosure(p.type));
        let ret = this.typeToClosure(funcType.type);
        return `function(${params.join(', ')}): ${ret}`;
      default:
        this.errorUnimplementedKind(node, 'converting type to closure');
        return '?';
    }
  }

  private visitTypeAlias(node: ts.TypeAliasDeclaration) {
    if (this.options.untyped) return;
    // Write a Closure typedef, which involves an unused "var" declaration.
    this.emit(`/** @typedef {${this.typeToClosure(node.type)}} */\n`);
    this.emit(`var ${node.name.getText()}: void;\n`);
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
        let enumConstValue = this.program.getTypeChecker().getConstantValue(member);
        if (enumConstValue) {
          i = enumConstValue + 1;
        }
      } else {
        this.emit(String(i));
        i++;
      }
      this.emit(';\n');
    }
  }

  /**
   * Produces a compiler error that references the Node's kind.  This is useful for the "else"
   * branch of code that is attempting to handle all possible input Node types, to ensure all cases
   * covered.
   */
  private errorUnimplementedKind(node: ts.Node, where: string) {
    this.error(node, `${ts.SyntaxKind[node.kind]} not implemented in ${where}`);
  }

  private error(node: ts.Node, messageText: string, start?: number, length?: number) {
    start = start || node.getStart();
    length = length || (node.getEnd() - node.getFullStart());
    this.diagnostics.push({
      file: this.file,
      start,
      length,
      messageText,
      category: ts.DiagnosticCategory.Error,
      code: undefined,
    });
  }
}

export function annotate(program: ts.Program, file: ts.SourceFile, options: Options = {}): Output {
  return new Annotator(program, file, options).annotate();
}

/**
 * PostProcessor postprocesses TypeScript compilation output JS, to rewrite commonjs require()s into
 * goog.require().
 */
class PostProcessor extends Rewriter {
  /**
   * defaultImportSymbols collects the names of imported goog.modules.  That is, if the code has
   *   var foo = goog.require('bar');
   * which comes from the TS input:
   *   import foo from 'goog:bar';
   * Then defaultImportSymbols['foo'] is true.
   * This is used to rewrite "foo.default" into just "foo".
   */
  defaultImportSymbols: {[varName: string]: boolean} = {};

  /** strippedStrict is true once we've stripped a "use strict"; from the input. */
  strippedStrict: boolean = false;

  /** unusedIndex is used to generate fresh symbols for unnamed imports. */
  unusedIndex: number = 0;

  constructor(
      file: ts.SourceFile,
      private pathToModuleName: (context: string, fileName: string) => string) {
    super(file);
  }

  process(): string {
    let pos = 0;
    let emittedModule = false;
    for (let stmt of this.file.statements) {
      this.writeRange(pos, stmt.getFullStart());
      if (!emittedModule) {
        // TODO(evanm): only emit the goog.module *after* the first comment,
        // so that @suppress statements work.
        const moduleName = this.pathToModuleName('', this.file.fileName);
        // NB: No linebreak after module call so sourcemaps are not offset.
        this.emit(`goog.module('${moduleName}');`);
        emittedModule = true;
      }
      this.visitTopLevel(stmt);
      pos = stmt.getEnd();
    }
    this.writeRange(pos, this.file.getEnd());

    return this.getOutput();
  }

  /**
   * visitTopLevel processes a top-level ts.Node and emits its contents.
   *
   * It's separate from the normal Rewriter recursive traversal
   * because some top-level statements are handled specially.
   */
  visitTopLevel(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.ExpressionStatement:
        // Check for "use strict" and skip it if necessary.
        if (!this.strippedStrict && this.isUseStrict(node)) {
          this.writeRange(node.getFullStart(), node.getStart());
          this.strippedStrict = true;
          return;
        }
        // Check for a bare "require('foo');", i.e. a require for its side effects.
        if (this.emitRewrittenRequires(node)) {
          return;
        }
        // Otherwise fall through to default processing.
        break;
      case ts.SyntaxKind.VariableStatement:
        // Check for a "var x = require('foo');".
        if (this.emitRewrittenRequires(node)) return;
        break;
      default:
        break;
    }
    this.visit(node);
  }

  /** isUseStrict returns true if node is a "use strict"; statement. */
  isUseStrict(node: ts.Node): boolean {
    if (node.kind !== ts.SyntaxKind.ExpressionStatement) return false;
    let exprStmt = node as ts.ExpressionStatement;
    let expr = exprStmt.expression;
    if (expr.kind !== ts.SyntaxKind.StringLiteral) return false;
    let literal = expr as ts.StringLiteral;
    return literal.text === 'use strict';
  }

  /**
   * emitRewrittenRequires rewrites require()s into goog.require() equivalents.
   *
   * @return True if the node was rewritten, false if needs ordinary processing.
   */
  emitRewrittenRequires(node: ts.Node): boolean {
    // We're looking for requires, of one of the forms:
    // - "var importName = require(...);".
    // - "require(...);".
    // Find the CallExpression contained in either of these.
    let varName: string;          // E.g. importName in the above example.
    let call: ts.CallExpression;  // The require(...) expression.
    if (node.kind === ts.SyntaxKind.VariableStatement) {
      // It's possibly of the form "var x = require(...);".
      let varStmt = node as ts.VariableStatement;

      // Verify it's a single decl (and not "var x = ..., y = ...;").
      if (varStmt.declarationList.declarations.length !== 1) return false;
      let decl = varStmt.declarationList.declarations[0];

      // Grab the variable name (avoiding things like destructuring binds).
      if (decl.name.kind !== ts.SyntaxKind.Identifier) return false;
      varName = (decl.name as ts.Identifier).text;
      if (!decl.initializer || decl.initializer.kind !== ts.SyntaxKind.CallExpression) return false;
      call = decl.initializer as ts.CallExpression;
    } else if (node.kind === ts.SyntaxKind.ExpressionStatement) {
      // It's possibly of the form "require(...);".
      let exprStmt = node as ts.ExpressionStatement;
      let expr = exprStmt.expression;
      if (expr.kind !== ts.SyntaxKind.CallExpression) return false;
      call = expr as ts.CallExpression;
    } else {
      // It's some other type of statement.
      return false;
    }

    // Verify that the call is a call to require()...
    if (call.expression.kind !== ts.SyntaxKind.Identifier) return false;
    let ident = call.expression as ts.Identifier;
    if (ident.text !== 'require') return false;

    // Verify the call takes a single string argument and grab it.
    if (call.arguments.length !== 1) return false;
    let arg = call.arguments[0];
    if (arg.kind !== ts.SyntaxKind.StringLiteral) return false;
    let require = (arg as ts.StringLiteral).text;

    // Even if it's a bare require(); statement, introduce a variable for it.
    // This avoids a Closure error.
    if (!varName) {
      varName = `unused_${this.unusedIndex++}_`;
    }

    if (require.match(/^goog:/)) {
      // This is an import of the form "goog:foo.bar".
      // Fix it to just "foo.bar", and save the module name.
      require = require.substr(5);
      this.defaultImportSymbols[varName] = true;
    }

    let modName = this.pathToModuleName(this.file.fileName, require);
    this.writeRange(node.getFullStart(), node.getStart());
    this.emit(`var ${varName} = goog.require('${modName}');`);
    return true;
  }

  /**
   * maybeProcess is called during the recursive traversal of the program's AST.
   *
   * @return True if the node was processed/emitted, false if it should be emitted as is.
   */
  protected maybeProcess(node: ts.Node): boolean {
    switch (node.kind) {
      case ts.SyntaxKind.PropertyAccessExpression:
        let propAccess = node as ts.PropertyAccessExpression;
        // We're looking for an expression of the form:
        //   module_name_var.default
        if (propAccess.name.text !== 'default') break;
        if (propAccess.expression.kind !== ts.SyntaxKind.Identifier) break;
        let lhsIdent = propAccess.expression as ts.Identifier;
        if (!this.defaultImportSymbols.hasOwnProperty(lhsIdent.text)) break;
        // Emit the same expression, with spaces to replace the ".default" part
        // so that source maps still line up.
        this.emit(`${lhsIdent.text}        `);
        return true;
      default:
        break;
    }
    return false;
  }
}

/**
 * Converts TypeScript's JS+CommonJS output to Closure goog.module etc.
 * For use as a postprocessing step *after* TypeScript emits JavaScript.
 *
 * @param fileName The source file name, without an extension.
 * @param pathToModuleName A function that maps a filesystem .ts path to a
 *     Closure module name, as found in a goog.require('...') statement.
 *     The context parameter is the referencing file, used for resolving
 *     imports with relative paths like "import * as foo from '../foo';".
 */
export function convertCommonJsToGoogModule(
    fileName: string, content: string, pathToModuleName: (context: string, fileName: string) =>
                                           string): {output: string, referencedModules: string[]} {
  let referencedModules: string[] = [];
  let file = ts.createSourceFile(fileName, content, ts.ScriptTarget.ES5, true);

  let output = new PostProcessor(file, pathToModuleName).process();
  return {output, referencedModules};
}
