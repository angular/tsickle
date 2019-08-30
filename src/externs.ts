/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview Externs creates Closure Compiler #externs definitions from the
 * ambient declarations in a TypeScript file.
 *
 * (Note that we cannot write the "@" form of the externs tag, even in comments,
 * because the compiler greps for it in source files(!).  So we write #externs
 * instead.)
 *
 * For example, a
 *   declare interface Foo { bar: string; }
 *
 * Would generate a
 *   /.. #externs ./
 *   /.. @record ./
 *   var Foo = function() {};
 *   /.. @type {string} ./
 *   Foo.prototype.bar;
 *
 * The generated externs indicate to Closure Compiler that symbols are external
 * to the optimization process, i.e. they are provided by outside code. That
 * most importantly means they must not be renamed or removed.
 *
 * A major difficulty here is that TypeScript supports module-scoped external
 * symbols; `.d.ts` files can contain `export`s and `import` other files.
 * Closure Compiler does not have such a concept, so tsickle must emulate the
 * behaviour. It does so by following this scheme:
 *
 * 1. non-module .d.ts produces global symbols
 * 2. module .d.ts produce symbols namespaced to the module, by creating a
 *    mangled name matching the current file's path. tsickle expects outside
 *    code (e.g. build system integration or manually written code) to contain a
 *    goog.module/provide that references the mangled path.
 * 3. declarations in `.ts` files produce types that can be separately emitted
 *    in e.g. an `externs.js`, using `getGeneratedExterns` below.
 *    1. non-exported symbols produce global types, because that's what users
 *       expect and it matches TypeScripts emit, which just references `Foo` for
 *       a locally declared symbol `Foo` in a module. Arguably these should be
 *       wrapped in `declare global { ... }`.
 *    2. exported symbols are scoped to the `.ts` file by prefixing them with a
 *       mangled name. Exported types are re-exported from the JavaScript
 *       `goog.module`, allowing downstream code to reference them. This has the
 *       same problem regarding ambient values as above, it is unclear where the
 *       value symbol would be defined, so for the time being this is
 *       unsupported.
 *
 * The effect of this is that:
 * - symbols in a module (i.e. not globals) are generally scoped to the local
 *   module using a mangled name, preventing symbol collisions on the Closure
 *   side.
 * - importing code can unconditionally refer to and import any symbol defined
 *   in a module `X` as `path.to.module.X`, regardless of whether the defining
 *   location is a `.d.ts` file or a `.ts` file, and regardless whether the
 *   symbol is ambient (assuming there's an appropriate shim).
 * - if there is a shim present, tsickle avoids emitting the Closure namespace
 *   itself, expecting the shim to provide the namespace and initialize it to a
 *   symbol that provides the right value at runtime (i.e. the implementation of
 *   whatever third party library the .d.ts describes).
 */

import * as ts from 'typescript';

import {AnnotatorHost, moduleNameAsIdentifier} from './annotator_host';
import {getEnumType} from './enum_transformer';
import {extractGoogNamespaceImport, resolveModuleName} from './googmodule';
import * as jsdoc from './jsdoc';
import {escapeForComment, maybeAddHeritageClauses, maybeAddTemplateClause} from './jsdoc_transformer';
import {ModuleTypeTranslator} from './module_type_translator';
import * as path from './path';
import {getEntityNameText, getIdentifierText, hasModifierFlag, isAmbient, isDtsFileName, reportDiagnostic} from './transformer_util';
import {isValidClosurePropertyName} from './type_translator';

/**
 * Symbols that are already declared as externs in Closure, that should
 * be avoided by tsickle's "declare ..." => externs.js conversion.
 */
const CLOSURE_EXTERNS_BLACKLIST: ReadonlyArray<string> = [
  'exports',
  'global',
  'module',
  // ErrorConstructor is the interface of the Error object itself.
  // tsickle detects that this is part of the TypeScript standard library
  // and assumes it's part of the Closure standard library, but this
  // assumption is wrong for ErrorConstructor.  To properly handle this
  // we'd somehow need to map methods defined on the ErrorConstructor
  // interface into properties on Closure's Error object, but for now it's
  // simpler to just blacklist it.
  'ErrorConstructor',
  'Symbol',
  'WorkerGlobalScope',
];


/**
 * The header to be used in generated externs.  This is not included in the output of
 * generateExterns() because generateExterns() works one file at a time, and typically you create
 * one externs file from the entire compilation unit.
 *
 * Suppressions:
 * - duplicate: because externs might duplicate re-opened definitions from other JS files.
 * - checkTypes: Closure's type system does not match TS'.
 * - undefinedNames: code below tries to be careful not to overwrite previously emitted definitions,
 *   but on the flip side might accidentally miss definitions.
 */
const EXTERNS_HEADER = `/**
 * @${''}externs
 * @suppress {duplicate,checkTypes}
 */
// NOTE: generated by tsickle, do not edit.
`;

/**
 * Concatenate all generated externs definitions together into a string, including a file comment
 * header.
 *
 * @param rootDir Project root.  Emitted comments will reference paths relative to this root.
 *    This param is effectively required, but made optional here until Angular is fixed.
 */
export function getGeneratedExterns(externs: {[fileName: string]: string}, rootDir = ''): string {
  let allExterns = EXTERNS_HEADER;
  for (const fileName of Object.keys(externs)) {
    allExterns += `// externs from ${path.relative(rootDir, fileName)}:\n`;
    allExterns += externs[fileName];
  }
  return allExterns;
}

/**
 * isInGlobalAugmentation returns true if declaration is the immediate child of a 'declare global'
 * block.
 */
function isInGlobalAugmentation(declaration: ts.Declaration): boolean {
  // declare global { ... } creates a ModuleDeclaration containing a ModuleBlock containing the
  // declaration, with the ModuleDeclaration having the GlobalAugmentation flag set.
  if (!declaration.parent || !declaration.parent.parent) return false;
  return (declaration.parent.parent.flags & ts.NodeFlags.GlobalAugmentation) !== 0;
}

/**
 * generateExterns generates extern definitions for all ambient declarations in the given source
 * file. It returns a string representation of the Closure JavaScript, not including the initial
 * comment with \@fileoverview and #externs (see above for that).
 */
export function generateExterns(
    typeChecker: ts.TypeChecker, sourceFile: ts.SourceFile, host: AnnotatorHost,
    moduleResolutionHost: ts.ModuleResolutionHost,
    options: ts.CompilerOptions): {output: string, diagnostics: ts.Diagnostic[]} {
  let output = '';
  const diagnostics: ts.Diagnostic[] = [];
  const isDts = isDtsFileName(sourceFile.fileName);
  const isExternalModule = ts.isExternalModule(sourceFile);

  const mtt =
      new ModuleTypeTranslator(sourceFile, typeChecker, host, diagnostics, /*isForExterns*/ true);

  let rootNamespace = '';
  if (isExternalModule) {
    // .d.ts files that are modules do not declare global symbols - their symbols must be explicitly
    // imported to be used. However Closure Compiler has no concept of externs that are modules and
    // require imports. This code mangles the symbol names by wrapping them in a top level variable
    // that's unique to this file. That allows emitting them for Closure as global symbols while
    // avoiding collisions. This is necessary as symbols local to this module can (and will very
    // commonly) conflict with the namespace used in "export as namespace", e.g. "angular", and also
    // to avoid users accidentally using these symbols in .js files (and more collisions). The
    // symbols that are "hidden" like that can be made accessible through an "export as namespace"
    // declaration (see below).
    rootNamespace = moduleNameAsIdentifier(host, sourceFile.fileName);
  }

  for (const stmt of sourceFile.statements) {
    if (!isDts && !hasModifierFlag(stmt as ts.DeclarationStatement, ts.ModifierFlags.Ambient)) {
      continue;
    }
    visitor(stmt, []);
  }

  /**
   * Convert a qualified name from a .d.ts file or declaration context into a mangled identifier.
   * E.g. for a qualified name in `export = someName;` or `import = someName;`.
   * If `someName` is `declare global { namespace someName {...} }`, tsickle must not qualify access
   * to it with the mangled module namespace as it is emitted in the global namespace. Similarly, if
   * the symbol is declared in a non-module context, it must not be mangled.
   */
  function qualifiedNameToMangledIdentifier(name: ts.Identifier|ts.QualifiedName) {
    const entityName = getEntityNameText(name);
    let symbol = typeChecker.getSymbolAtLocation(name);
    if (symbol) {
      // If this is an aliased name (e.g. from an import), use the alias to refer to it.
      if (symbol.flags & ts.SymbolFlags.Alias) {
        symbol = typeChecker.getAliasedSymbol(symbol);
      }
      const alias = mtt.symbolsToAliasedNames.get(symbol);
      if (alias) return alias;
      const isGlobalSymbol = symbol && symbol.declarations && symbol.declarations.some(d => {
        if (isInGlobalAugmentation(d)) return true;
        // If the declaration's source file is not a module, it must be global.
        // If it is a module, the identifier must be local to this file, or handled above via the
        // alias.
        return !ts.isExternalModule(d.getSourceFile());
      });
      if (isGlobalSymbol) return entityName;
    }
    return rootNamespace + '.' + entityName;
  }

  if (output && isExternalModule) {
    // If tsickle generated any externs and this is an external module, prepend the namespace
    // declaration for it.
    output = `/** @const */\nvar ${rootNamespace} = {};\n` + output;

    // There can only be one export =.
    const exportAssignment = sourceFile.statements.find(ts.isExportAssignment);
    let exportedNamespace = rootNamespace;
    if (exportAssignment && exportAssignment.isExportEquals) {
      if (ts.isIdentifier(exportAssignment.expression) ||
          ts.isQualifiedName(exportAssignment.expression)) {
        // E.g. export = someName;
        // If someName is "declare global { namespace someName {...} }", tsickle must not qualify
        // access to it with module namespace as it is emitted in the global namespace.
        exportedNamespace = qualifiedNameToMangledIdentifier(exportAssignment.expression);
      } else {
        reportDiagnostic(
            diagnostics, exportAssignment.expression,
            `export = expression must be a qualified name, got ${
                ts.SyntaxKind[exportAssignment.expression.kind]}.`);
      }
    }

    if (isDts && host.provideExternalModuleDtsNamespace) {
      // In a non-shimmed module, create a global namespace. This exists purely for backwards
      // compatiblity, in the medium term all code using tsickle should always use `goog.module`s,
      // so global names should not be neccessary.
      for (const nsExport of sourceFile.statements.filter(ts.isNamespaceExportDeclaration)) {
        const namespaceName = getIdentifierText(nsExport.name);
        emit(`// export as namespace ${namespaceName}\n`);
        writeVariableStatement(namespaceName, [], exportedNamespace);
      }
    }
  }

  return {output, diagnostics};

  function emit(str: string) {
    output += str;
  }

  /**
   * isFirstDeclaration returns true if decl is the first declaration
   * of its symbol.  E.g. imagine
   *   interface Foo { x: number; }
   *   interface Foo { y: number; }
   * we only want to emit the "\@record" for Foo on the first one.
   *
   * The exception are variable declarations, which - in externs - do not assign a value:
   *   /.. \@type {...} ./
   *   var someVariable;
   *   /.. \@type {...} ./
   *   someNamespace.someVariable;
   * If a later declaration wants to add additional properties on someVariable, tsickle must still
   * emit an assignment into the object, as it's otherwise absent.
   */
  function isFirstValueDeclaration(decl: ts.DeclarationStatement): boolean {
    if (!decl.name) return true;
    const sym = typeChecker.getSymbolAtLocation(decl.name)!;
    if (!sym.declarations || sym.declarations.length < 2) return true;
    const earlierDecls = sym.declarations.slice(0, sym.declarations.indexOf(decl));
    // Either there are no earlier declarations, or all of them are variables (see above). tsickle
    // emits a value for all other declaration kinds (function for functions, classes, interfaces,
    // {} object for namespaces).
    return earlierDecls.length === 0 || earlierDecls.every(ts.isVariableDeclaration);
  }

  /** Writes the actual variable statement of a Closure variable declaration. */
  function writeVariableStatement(name: string, namespace: ReadonlyArray<string>, value?: string) {
    const qualifiedName = namespace.concat([name]).join('.');
    if (namespace.length === 0) emit(`var `);
    emit(qualifiedName);
    if (value) emit(` = ${value}`);
    emit(';\n');
  }

  /**
   * Writes a Closure variable declaration, i.e. the variable statement with a leading JSDoc
   * comment making it a declaration.
   */
  function writeVariableDeclaration(
      decl: ts.VariableDeclaration, namespace: ReadonlyArray<string>) {
    if (decl.name.kind === ts.SyntaxKind.Identifier) {
      const name = getIdentifierText(decl.name as ts.Identifier);
      if (CLOSURE_EXTERNS_BLACKLIST.indexOf(name) >= 0) return;
      emit(jsdoc.toString([{tagName: 'type', type: mtt.typeToClosure(decl)}]));
      emit('\n');
      writeVariableStatement(name, namespace);
    } else {
      errorUnimplementedKind(decl.name, 'externs for variable');
    }
  }

  /**
   * Emits a JSDoc declaration that merges the signatures of the given function declaration (for
   * overloads), and returns the parameter names chosen.
   */
  function emitFunctionType(decls: ts.FunctionLikeDeclaration[], extraTags: jsdoc.Tag[] = []) {
    const {tags, parameterNames} = mtt.getFunctionTypeJSDoc(decls, extraTags);
    emit('\n');
    emit(jsdoc.toString(tags));
    return parameterNames;
  }

  function writeFunction(name: ts.Node, params: string[], namespace: ReadonlyArray<string>) {
    const paramsStr = params.join(', ');
    if (namespace.length > 0) {
      let fqn = namespace.join('.');
      if (name.kind === ts.SyntaxKind.Identifier) {
        fqn += '.';  // computed names include [ ] in their getText() representation.
      }
      fqn += name.getText();
      emit(`${fqn} = function(${paramsStr}) {};\n`);
    } else {
      if (name.kind !== ts.SyntaxKind.Identifier) {
        reportDiagnostic(diagnostics, name, 'Non-namespaced computed name in externs');
      }
      emit(`function ${name.getText()}(${paramsStr}) {}\n`);
    }
  }

  function writeEnum(decl: ts.EnumDeclaration, namespace: ReadonlyArray<string>) {
    // E.g. /** @enum {number} */ var COUNTRY = {US: 1, CA: 1};
    const name = getIdentifierText(decl.name);
    let members = '';
    const enumType = getEnumType(typeChecker, decl);
    // Closure enums members must have a value of the correct type, but the actual value does not
    // matter in externs.
    const initializer = enumType === 'string' ? `''` : 1;
    for (const member of decl.members) {
      let memberName: string|undefined;
      switch (member.name.kind) {
        case ts.SyntaxKind.Identifier:
          memberName = getIdentifierText(member.name as ts.Identifier);
          break;
        case ts.SyntaxKind.StringLiteral:
          const text = (member.name as ts.StringLiteral).text;
          if (isValidClosurePropertyName(text)) memberName = text;
          break;
        default:
          break;
      }
      if (!memberName) {
        members += `  /* TODO: ${ts.SyntaxKind[member.name.kind]}: ${
            escapeForComment(member.name.getText())} */\n`;
        continue;
      }
      members += `  ${memberName}: ${initializer},\n`;
    }

    emit(`\n/** @enum {${enumType}} */\n`);
    writeVariableStatement(name, namespace, `{\n${members}}`);
  }

  function writeTypeAlias(decl: ts.TypeAliasDeclaration, namespace: ReadonlyArray<string>) {
    const typeStr = mtt.typeToClosure(decl, undefined);
    emit(`\n/** @typedef {${typeStr}} */\n`);
    writeVariableStatement(getIdentifierText(decl.name), namespace);
  }

  function writeType(
      decl: ts.InterfaceDeclaration|ts.ClassDeclaration, namespace: ReadonlyArray<string>) {
    const name = decl.name;
    if (!name) {
      reportDiagnostic(diagnostics, decl, 'anonymous type in externs');
      return;
    }
    const typeName = namespace.concat([name.getText()]).join('.');
    if (CLOSURE_EXTERNS_BLACKLIST.indexOf(typeName) >= 0) return;

    if (isFirstValueDeclaration(decl)) {
      // Emit the 'function' that is actually the declaration of the interface
      // itself.  If it's a class, this function also must include the type
      // annotations of the constructor.
      let paramNames: string[] = [];
      const jsdocTags: jsdoc.Tag[] = [];
      let wroteJsDoc = false;
      maybeAddHeritageClauses(jsdocTags, mtt, decl);
      maybeAddTemplateClause(jsdocTags, decl);
      if (decl.kind === ts.SyntaxKind.ClassDeclaration) {
        // TODO: it appears you can just write 'class Foo { ...' in externs.
        // This code instead tries to translate it to a function.
        jsdocTags.push({tagName: 'constructor'}, {tagName: 'struct'});
        const ctors = (decl as ts.ClassDeclaration)
                          .members.filter((m) => m.kind === ts.SyntaxKind.Constructor);
        if (ctors.length) {
          const firstCtor: ts.ConstructorDeclaration = ctors[0] as ts.ConstructorDeclaration;
          if (ctors.length > 1) {
            paramNames = emitFunctionType(ctors as ts.ConstructorDeclaration[], jsdocTags);
          } else {
            paramNames = emitFunctionType([firstCtor], jsdocTags);
          }
          wroteJsDoc = true;
        }
      } else {
        // Otherwise it's an interface; tag it as structurally typed.
        jsdocTags.push({tagName: 'record'}, {tagName: 'struct'});
      }
      if (!wroteJsDoc) emit(jsdoc.toString(jsdocTags));
      writeFunction(name, paramNames, namespace);
    }

    // Process everything except (MethodSignature|MethodDeclaration|Constructor)
    const methods = new Map<string, ts.MethodDeclaration[]>();
    for (const member of decl.members) {
      switch (member.kind) {
        case ts.SyntaxKind.PropertySignature:
        case ts.SyntaxKind.PropertyDeclaration:
          const prop = member as ts.PropertySignature;
          if (prop.name.kind === ts.SyntaxKind.Identifier) {
            let type = mtt.typeToClosure(prop);
            if (prop.questionToken && type === '?') {
              // An optional 'any' type translates to '?|undefined' in Closure.
              type = '?|undefined';
            }
            emit(jsdoc.toString([{tagName: 'type', type}]));
            if (hasModifierFlag(prop, ts.ModifierFlags.Static)) {
              emit(`\n${typeName}.${prop.name.getText()};\n`);
            } else {
              emit(`\n${typeName}.prototype.${prop.name.getText()};\n`);
            }
            continue;
          }
          // TODO: For now property names other than Identifiers are not handled; e.g.
          //    interface Foo { "123bar": number }
          break;
        case ts.SyntaxKind.MethodSignature:
        case ts.SyntaxKind.MethodDeclaration:
          const method = member as ts.MethodDeclaration;
          const isStatic = hasModifierFlag(method, ts.ModifierFlags.Static);
          const methodSignature = `${method.name.getText()}$$$${isStatic ? 'static' : 'instance'}`;

          if (methods.has(methodSignature)) {
            methods.get(methodSignature)!.push(method);
          } else {
            methods.set(methodSignature, [method]);
          }
          continue;
        case ts.SyntaxKind.Constructor:
          continue;  // Handled above.
        default:
          // Members can include things like index signatures, for e.g.
          //   interface Foo { [key: string]: number; }
          // For now, just skip it.
          break;
      }
      // If we get here, the member wasn't handled in the switch statement.
      let memberName = namespace;
      if (member.name) {
        memberName = memberName.concat([member.name.getText()]);
      }
      emit(`\n/* TODO: ${ts.SyntaxKind[member.kind]}: ${memberName.join('.')} */\n`);
    }

    // Handle method declarations/signatures separately, since we need to deal with overloads.
    for (const methodVariants of Array.from(methods.values())) {
      const firstMethodVariant = methodVariants[0];
      let parameterNames: string[];
      if (methodVariants.length > 1) {
        parameterNames = emitFunctionType(methodVariants);
      } else {
        parameterNames = emitFunctionType([firstMethodVariant]);
      }
      const methodNamespace = namespace.concat([name.getText()]);
      // If the method is static, don't add the prototype.
      if (!hasModifierFlag(firstMethodVariant, ts.ModifierFlags.Static)) {
        methodNamespace.push('prototype');
      }
      writeFunction(firstMethodVariant.name, parameterNames, methodNamespace);
    }
  }

  function writeExportDeclaration(
      exportDeclaration: ts.ExportDeclaration, namespace: ReadonlyArray<string>) {
    if (!exportDeclaration.exportClause) {
      emit(`\n// TODO(tsickle): export * declaration in ${
          debugLocationStr(exportDeclaration, namespace)}\n`);
      return;
    }
    for (const exportSpecifier of exportDeclaration.exportClause.elements) {
      // No need to do anything for properties exported under their original name.
      if (!exportSpecifier.propertyName) continue;
      emit('/** @const */\n');
      writeVariableStatement(
          exportSpecifier.name.text, namespace,
          namespace.join('.') + '.' + exportSpecifier.propertyName.text);
    }
  }

  /**
   * Adds aliases for the symbols imported in the given declaration, so that their types get
   * printed as the fully qualified name, and not just as a reference to the local import alias.
   *
   * tsickle generates .js files that (at most) contain a `goog.provide`, but are not
   * `goog.module`s. These files cannot express an aliased import. However Closure Compiler allows
   * referencing types using fully qualified names in such files, so tsickle can resolve the
   * imported module URI and produce `path.to.module.Symbol` as an alias, and use that when
   * referencing the type.
   */
  function addImportAliases(decl: ts.ImportDeclaration|ts.ImportEqualsDeclaration) {
    let moduleUri: string;
    if (ts.isImportDeclaration(decl)) {
      moduleUri = (decl.moduleSpecifier as ts.StringLiteral).text;
    } else if (ts.isExternalModuleReference(decl.moduleReference)) {
      // import foo = require('./bar');
      moduleUri = (decl.moduleReference.expression as ts.StringLiteral).text;
    } else {
      // import foo = bar.baz.bam;
      // handled at call site.
      return;
    }

    const googNamespace = extractGoogNamespaceImport(moduleUri);
    const moduleName = googNamespace ||
        host.pathToModuleName(
            sourceFile.fileName, resolveModuleName(host, sourceFile.fileName, moduleUri));

    if (ts.isImportEqualsDeclaration(decl)) {
      // import foo = require('./bar');
      addImportAlias(decl.name, moduleName, false, undefined);
      return;
    }

    // Side effect import, like "import 'somepath';" declares no local aliases.
    if (!decl.importClause) return;

    if (decl.importClause.name) {
      // import name from ... -> map to .default on the module.name.
      if (googNamespace) {
        addImportAlias(decl.importClause.name, googNamespace, true, undefined);
      } else {
        addImportAlias(decl.importClause.name, moduleName, false, 'default');
      }
    }
    const namedBindings = decl.importClause.namedBindings;
    if (!namedBindings) return;

    if (ts.isNamespaceImport(namedBindings)) {
      // import * as name -> map directly to the module.name.
      addImportAlias(namedBindings.name, moduleName, false, undefined);
    }

    if (ts.isNamedImports(namedBindings)) {
      // import {A as B}, map to module.name.A
      for (const namedBinding of namedBindings.elements) {
        addImportAlias(namedBinding.name, moduleName, false, namedBinding.name);
      }
    }
  }

  /**
   * Adds an import alias for the symbol defined at the given node. Creates an alias name based on
   * the given moduleName and (optionally) the name.
   */
  function addImportAlias(
      node: ts.Node, moduleName: string, isGoogImport: boolean,
      name: ts.Identifier|string|undefined) {
    let symbol = typeChecker.getSymbolAtLocation(node);
    if (!symbol) {
      reportDiagnostic(diagnostics, node, `named import has no symbol`);
      return;
    }
    if (symbol.flags & ts.SymbolFlags.Alias) {
      symbol = typeChecker.getAliasedSymbol(symbol);
    }
    // While type_translator does add the mangled prefix for ambient declarations, it only does so
    // for non-aliased (i.e. not imported) symbols. That's correct for its use in regular modules,
    // which will have a local symbol for the imported ambient symbol. However within an externs
    // file, there are no imports, so we need to make sure the alias already contains the correct
    // module name, which means the mangled module name in case of imports symbols.
    // This only applies to non-Closure ('goog:') imports.
    if (symbol.declarations && !isGoogImport && symbol.declarations.some(d => isAmbient(d))) {
      moduleName = moduleNameAsIdentifier(host, moduleName);
    }
    let aliasName = moduleName;
    if (typeof name === 'string') {
      aliasName += '.' + name;
    } else if (name) {
      aliasName += '.' + getIdentifierText(name);
    }
    mtt.symbolsToAliasedNames.set(symbol, aliasName);
  }

  /**
   * Produces a compiler error that references the Node's kind. This is useful for the "else"
   * branch of code that is attempting to handle all possible input Node types, to ensure all cases
   * covered.
   */
  function errorUnimplementedKind(node: ts.Node, where: string) {
    reportDiagnostic(diagnostics, node, `${ts.SyntaxKind[node.kind]} not implemented in ${where}`);
  }

  /**
   * getNamespaceForLocalDeclaration returns the namespace that should be used for the given
   * declaration, deciding whether to namespace the symbol to the file or whether to create a
   * global name.
   *
   * The function covers these cases:
   * 1) a declaration in a .d.ts
   * 1a) where the .d.ts is an external module     --> namespace
   * 1b) where the .d.ts is not an external module --> global
   * 2) a declaration in a .ts file (all are treated as modules)
   * 2a) that is exported                          --> namespace
   * 2b) that is unexported                        --> global
   *
   * For 1), all symbols in .d.ts should generally be namespaced to the file to avoid collisions.
   * However .d.ts files that are not external modules do declare global names (1b).
   *
   * For 2), ambient declarations in .ts files must be namespaced, for the same collision reasons.
   * The exception is 2b), where in TypeScript, an unexported local "declare const x: string;"
   * creates a symbol that, when used locally, is emitted as just "x". That is, it behaves
   * like a variable declared in a 'declare global' block. Closure Compiler would fail the build if
   * there is no declaration for "x", so tsickle must generate a global external symbol, i.e.
   * without the namespace wrapper.
   */
  function getNamespaceForTopLevelDeclaration(
      declaration: ts.Declaration, namespace: ReadonlyArray<string>): ReadonlyArray<string> {
    // Only use rootNamespace for top level symbols, any other namespacing (global names, nested
    // namespaces) is always kept.
    if (namespace.length !== 0) return namespace;
    // All names in a module (external) .d.ts file can only be accessed locally, so they always get
    // namespace prefixed.
    if (isDts && isExternalModule) return [rootNamespace];
    // Same for exported declarations in regular .ts files.
    if (hasModifierFlag(declaration, ts.ModifierFlags.Export)) return [rootNamespace];
    // But local declarations in .ts files or .d.ts files (1b, 2b) are global, too.
    return [];
  }

  /**
   * Returns a string representation for the location: either the namespace, or, if empty, the
   * current source file name. This is intended to be included in the emit for warnings, so that
   * users can more easily find where a problematic definition is from.
   *
   * The code below does not use diagnostics to avoid breaking the build for harmless unhandled
   * cases.
   */
  function debugLocationStr(node: ts.Node, namespace: ReadonlyArray<string>) {
    // Use a regex to grab the filename without a path, to make the output stable
    // under bazel where sandboxes use different paths.
    return namespace.join('.') || node.getSourceFile().fileName.replace(/.*[/\\]/, '');
  }

  function visitor(node: ts.Node, namespace: ReadonlyArray<string>) {
    if (node.parent === sourceFile) {
      namespace = getNamespaceForTopLevelDeclaration(node as ts.DeclarationStatement, namespace);
    }

    switch (node.kind) {
      case ts.SyntaxKind.ModuleDeclaration:
        const decl = node as ts.ModuleDeclaration;
        switch (decl.name.kind) {
          case ts.SyntaxKind.Identifier:
            if (decl.flags & ts.NodeFlags.GlobalAugmentation) {
              // E.g. "declare global { ... }".  Reset to the outer namespace.
              namespace = [];
            } else {
              // E.g. "declare namespace foo {"
              const name = getIdentifierText(decl.name as ts.Identifier);
              if (isFirstValueDeclaration(decl)) {
                emit('/** @const */\n');
                writeVariableStatement(name, namespace, '{}');
              }
              namespace = namespace.concat(name);
            }
            if (decl.body) visitor(decl.body, namespace);
            break;
          case ts.SyntaxKind.StringLiteral:
            // E.g. "declare module 'foo' {" (note the quotes).
            // We still want to emit externs for this module, but Closure doesn't provide a
            // mechanism for module-scoped externs. Instead, we emit in a mangled namespace.
            // The mangled namespace (after resolving files) matches the emit for an original module
            // file, so effectively this augments any existing module.

            const importName = (decl.name as ts.StringLiteral).text;
            const importedModuleName =
                resolveModuleName({moduleResolutionHost, options}, sourceFile.fileName, importName);
            const mangled = moduleNameAsIdentifier(host, importedModuleName);
            emit(`// Derived from: declare module "${importName}"\n`);
            namespace = [mangled];

            // Declare "mangled$name" if it's not declared already elsewhere.
            if (isFirstValueDeclaration(decl)) {
              emit('/** @const */\n');
              writeVariableStatement(mangled, [], '{}');
            }
            // Declare the contents inside the "mangled$name".
            if (decl.body) visitor(decl.body, [mangled]);
            break;
          default:
            errorUnimplementedKind(decl.name, 'externs generation of namespace');
            break;
        }
        break;
      case ts.SyntaxKind.ModuleBlock:
        const block = node as ts.ModuleBlock;
        for (const stmt of block.statements) {
          visitor(stmt, namespace);
        }
        break;
      case ts.SyntaxKind.ImportEqualsDeclaration:
        const importEquals = node as ts.ImportEqualsDeclaration;
        const localName = getIdentifierText(importEquals.name);
        if (importEquals.moduleReference.kind === ts.SyntaxKind.ExternalModuleReference) {
          addImportAliases(importEquals);
          break;
        }
        const qn = qualifiedNameToMangledIdentifier(importEquals.moduleReference);
        // @const so that Closure Compiler understands this is an alias.
        emit('/** @const */\n');
        writeVariableStatement(localName, namespace, qn);
        break;
      case ts.SyntaxKind.ClassDeclaration:
      case ts.SyntaxKind.InterfaceDeclaration:
        writeType(node as ts.InterfaceDeclaration | ts.ClassDeclaration, namespace);
        break;
      case ts.SyntaxKind.FunctionDeclaration:
        const fnDecl = node as ts.FunctionDeclaration;
        const name = fnDecl.name;
        if (!name) {
          reportDiagnostic(diagnostics, fnDecl, 'anonymous function in externs');
          break;
        }
        // Gather up all overloads of this function.
        const sym = typeChecker.getSymbolAtLocation(name)!;
        const decls = sym.declarations!.filter(ts.isFunctionDeclaration);
        // Only emit the first declaration of each overloaded function.
        if (fnDecl !== decls[0]) break;
        const params = emitFunctionType(decls);
        writeFunction(name, params, namespace);
        break;
      case ts.SyntaxKind.VariableStatement:
        for (const decl of (node as ts.VariableStatement).declarationList.declarations) {
          writeVariableDeclaration(decl, namespace);
        }
        break;
      case ts.SyntaxKind.EnumDeclaration:
        writeEnum(node as ts.EnumDeclaration, namespace);
        break;
      case ts.SyntaxKind.TypeAliasDeclaration:
        writeTypeAlias(node as ts.TypeAliasDeclaration, namespace);
        break;
      case ts.SyntaxKind.ImportDeclaration:
        addImportAliases(node as ts.ImportDeclaration);
        break;
      case ts.SyntaxKind.NamespaceExportDeclaration:
      case ts.SyntaxKind.ExportAssignment:
        // Handled on the file level.
        break;
      case ts.SyntaxKind.ExportDeclaration:
        const exportDeclaration = node as ts.ExportDeclaration;
        writeExportDeclaration(exportDeclaration, namespace);
        break;
      default:
        emit(`\n// TODO(tsickle): ${ts.SyntaxKind[node.kind]} in ${
            debugLocationStr(node, namespace)}\n`);
        break;
    }
  }
}
