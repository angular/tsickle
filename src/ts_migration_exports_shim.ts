/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Processes goog.tsMigrationExportsShim, goog.tsMigrationDefaultExportsShim,
 * and goog.tsMigrationNamedExportsShim statements into
 * ".legacy.closure.js" and ".legacy.d.ts" files.
 */

import * as ts from 'typescript';

import {ModulesManifest} from './modules_manifest';
import {getGoogFunctionName, isAnyTsmesCall, isGoogCallExpressionOf, isTsmesShorthandCall, reportDiagnostic} from './transformer_util';

/** Silence linter. */
export interface TsMigrationExportsShimResult {
  filename: string;
  content: string;
  diagnostics: ts.Diagnostic[];
}

/** Provides dependencies for file generation. */
export interface TsMigrationExportsShimProcessorHost {
  /** If true emit .legacy.closure.js file, else emit .legacy.d.ts */
  transformTypesToClosure?: boolean;

  /** See compiler_host.ts */
  pathToModuleName(context: string, importPath: string): string;

  /** See compiler_host.ts */
  rootDirsRelative(fileName: string): string;
}

/** Silence linter. */
export function generateTsMigrationExportsShimFile(
    src: ts.SourceFile, typeChecker: ts.TypeChecker,
    host: TsMigrationExportsShimProcessorHost,
    manifest: ModulesManifest): TsMigrationExportsShimResult {
  const srcFilename = host.rootDirsRelative(src.fileName);
  const srcModuleId = host.pathToModuleName('', src.fileName);
  const srcIds = new FileIdGroup(srcFilename, srcModuleId);

  return new Generator(src, typeChecker, host, manifest, srcIds).run();
}

/**
 * Does this path have a file extension that supports
 * calls to tsmes?
 */
export function pathHasSupportedExtension(p: string): boolean {
  return Boolean(p.match(SUPPORTED_EXTENSIONS));
}

function stripSupportedExtensions(path: string) {
  return path.replace(SUPPORTED_EXTENSIONS, '');
}

// .ts but not .d.ts
const SUPPORTED_EXTENSIONS = /(?<!\.d)\.ts$/;


/**
 * A one-time-use object for generating TS Migration Export Shims.
 *
 * The generator is able to emit two different outputs: .js and .d.ts. Only one
 * of thse should be produced for a given src file. The choice of which depends
 * on whether tsickle is producing code for downstream typechecking (.d.ts file
 * for TS libraries) or optimization (.js files for Closure Compiler).
 */
class Generator {
  readonly diagnostics: ts.Diagnostic[] = [];
  readonly mainExports: ts.Symbol[];

  outputIds: FileIdGroup|undefined;
  googExports: GoogExports|undefined;

  constructor(
      readonly src: ts.SourceFile,
      readonly typeChecker: ts.TypeChecker,
      readonly host: TsMigrationExportsShimProcessorHost,
      readonly manifest: ModulesManifest,
      readonly srcIds: FileIdGroup,
  ) {
    const moduleSymbol = this.typeChecker.getSymbolAtLocation(this.src);
    this.mainExports =
        moduleSymbol ? this.typeChecker.getExportsOfModule(moduleSymbol) : [];
  }

  run(): TsMigrationExportsShimResult {
    const outputFilename = this.srcIds.google3PathWithoutExtension() +
        (this.host.transformTypesToClosure ? '.tsmes.closure.js' :
                                             '.tsmes.d.ts');

    const tsmessBreakdown = this.extractTsmesStatement();
    if (!tsmessBreakdown) {
      return {
        filename: outputFilename,
        content: '',
        diagnostics: this.diagnostics,
      };
    }

    this.outputIds =
        new FileIdGroup(outputFilename, tsmessBreakdown.googModuleId);
    this.googExports = tsmessBreakdown.googExports;

    return {
      filename: outputFilename,
      content: this.host.transformTypesToClosure ? this.generateTsmesJs() :
                                                   this.generateTsmesDts(),
      diagnostics: this.diagnostics,
    };
  }

  /**
   * Finds the top-level call to tsmes in the input, if any,
   * and returns the relevant info from within.
   *
   * If no such call exists, or the call is malformed, returns undefined.
   * Diagnostics about malformed calls will also be logged.
   */
  private extractTsmesStatement(): undefined|TsmesCallBreakdown {
    let tsmesCall: ts.CallExpression|undefined = undefined;
    for (const statement of this.src.statements) {
      if (!ts.isExpressionStatement(statement) ||
          !isAnyTsmesCall(statement.expression)) {
        this.checkNonTopLevelTsmesCalls(statement);
        continue;
      }

      const call = statement.expression;
      if (tsmesCall) {
        this.report(
            call,
            'at most one call to any of goog.tsMigrationExportsShim, ' +
                'goog.tsMigrationDefaultExportsShim, ' +
                'goog.tsMigrationNamedExportsShim is allowed per file');
      } else {
        tsmesCall = call;
      }
    }

    if (!tsmesCall) {
      return undefined;
    }

    if (isGoogCallExpressionOf(tsmesCall, 'tsMigrationExportsShim') &&
        tsmesCall.arguments.length !== 2) {
      this.report(
          tsmesCall, 'goog.tsMigrationExportsShim requires 2 arguments');
      return undefined;
    }
    if (isTsmesShorthandCall(tsmesCall) && tsmesCall.arguments.length !== 1) {
      this.report(
          tsmesCall,
          `goog.${
              getGoogFunctionName(tsmesCall)} requires exactly one argument`);
      return undefined;
    }
    if (isGoogCallExpressionOf(tsmesCall, 'tsMigrationDefaultExportsShim') &&
        this.mainExports.length !== 1) {
      this.report(
          tsmesCall,
          'can only call goog.tsMigrationDefaultExportsShim when there is' +
              ' exactly one export.');
      return undefined;
    }
    const [moduleId, exportsExpr] = tsmesCall.arguments;
    if (!ts.isStringLiteral(moduleId)) {
      this.report(
          moduleId,
          `goog.${getGoogFunctionName(tsmesCall)} ID must be a string literal`);
      return undefined;
    }

    let googExports: GoogExports|undefined = undefined;
    const fnName = getGoogFunctionName(tsmesCall);
    switch (fnName) {
      case 'tsMigrationDefaultExportsShim':
        // Export the one and only export as an unnamed export.
        // vis. export = foo;
        googExports = this.mainExports[0].name;
        break;
      case 'tsMigrationNamedExportsShim':
        // Export all exports as named exports
        // vis. export.a = a;
        //      export.b = b;
        googExports = new Map<string, string>();
        for (const mainExport of this.mainExports) {
          googExports.set(mainExport.name, mainExport.name);
        }
        break;
      case 'tsMigrationExportsShim':
        // Export the structure described by exportsExpr
        googExports = this.extractGoogExports(exportsExpr);
        break;
      default:
        this.report(tsmesCall, `encountered unhandled goog.$fnName: ${fnName}`);
        throw new Error();
    }
    return googExports === undefined ? undefined : {
      googModuleId: moduleId.text,
      googExports,
    };
  }

  /**
   * Given the exports from a tsmes call, return a simplified model of the
   * relevant values.
   *
   * If the exports are malformed, returns undefined. Diagnostics about
   * malformed exports are also logged.
   */
  private extractGoogExports(exportsExpr: ts.Expression): GoogExports
      |undefined {
    let googExports: GoogExports|undefined;
    const diagnosticCount = this.diagnostics.length;

    if (ts.isObjectLiteralExpression(exportsExpr)) {
      googExports = new Map();
      for (const property of exportsExpr.properties) {
        if (ts.isShorthandPropertyAssignment(property)) {
          // {Bar}
          const symbol =
              this.typeChecker.getShorthandAssignmentValueSymbol(property);
          this.checkIsModuleExport(property.name, symbol);
          googExports.set(property.name.text, property.name.text);
        } else if (ts.isPropertyAssignment(property)) {
          // {Foo: Bar}
          const name = property.name;
          if (!ts.isIdentifier(name)) {
            this.report(name, 'export names must be simple keys');
            continue;
          }

          const initializer = property.initializer;

          let identifier: ts.Identifier|null = null;
          if (ts.isAsExpression(initializer)) {
            identifier = this.maybeExtractTypeName(initializer);
          } else if (ts.isIdentifier(initializer)) {
            identifier = initializer;
          } else {
            this.report(initializer, 'export values must be plain identifiers');
            continue;
          }

          if (identifier == null) {
            continue;
          }

          const symbol = this.typeChecker.getSymbolAtLocation(identifier);
          this.checkIsModuleExport(identifier, symbol);
          googExports.set(name.text, identifier.text);
        } else {
          this.report(
              property,
              `exports object must only contain (shorthand) properties`);
        }
      }
    } else if (ts.isIdentifier(exportsExpr)) {
      const symbol = this.typeChecker.getSymbolAtLocation(exportsExpr);
      this.checkIsModuleExport(exportsExpr, symbol);
      googExports = exportsExpr.text;
    } else if (ts.isAsExpression(exportsExpr)) {
      // {} as DefaultTypeExport
      const identifier = this.maybeExtractTypeName(exportsExpr);
      if (!identifier) {
        return undefined;
      }
      const symbol = this.typeChecker.getSymbolAtLocation(identifier);
      this.checkIsModuleExport(identifier, symbol);
      googExports = identifier.text;
    } else {
      this.report(
          exportsExpr,
          `exports object must be either an object literal ({A, B}) or the ` +
              `identifier of a module export (A)`);
    }

    return (diagnosticCount === this.diagnostics.length) ? googExports :
                                                           undefined;
  }

  private maybeExtractTypeName(cast: ts.AsExpression): ts.Identifier|null {
    if (!ts.isObjectLiteralExpression(cast.expression) ||
        cast.expression.properties.length !== 0) {
      this.report(cast.expression, 'must be object literal with no keys');
      return null;
    }

    const typeRef = cast.type;
    if (!ts.isTypeReferenceNode(typeRef)) {
      this.report(typeRef, 'must be a type reference');
      return null;
    }

    const typeName = typeRef.typeName;
    if (typeRef.typeArguments || !ts.isIdentifier(typeName)) {
      this.report(typeRef, 'export types must be plain identifiers');
      return null;
    }

    return typeName;
  }

  /**
   * Recurse through top-level statments looking for tsmes calls.
   *
   * tsmes is only allowed as a top-level statement, so if we find it deeper
   * down we report an error.
   */
  private checkNonTopLevelTsmesCalls(topLevelStatement: ts.Statement) {
    const inner = (node: ts.Node): void => {
      if (isAnyTsmesCall(node)) {
        const name = getGoogFunctionName(node);
        this.report(
            node, `goog.${name} is only allowed in top level statements`);
      }
      ts.forEachChild(node, inner);
    };

    ts.forEachChild(topLevelStatement, inner);
  }

  /**
   * Generate the JS file that other JS files will goog.require to use the
   * shimmed export layout.
   */
  private generateTsmesJs(): string {
    if (!this.outputIds || !this.googExports) {
      throw new Error();
    }

    const mainRequireImports = this.mainExports.map((e) => e.name).join(', ');
    const mainModuleRequire = `const { ${mainRequireImports} } = ` +
        `goog.require('${this.srcIds.googModuleId}');`;

    let exportsAssignment;
    if (this.googExports instanceof Map) {
      // In the case that tsmes was passed named exports.
      const bindings =
          Array.from(this.googExports).map(([k, v]) => `  ${k}: ${v},`);
      exportsAssignment = lines(
          `exports = {`,
          ...bindings,
          `};`,
      );
    } else {
      // In the case that tsmes was passed a default export.
      exportsAssignment = `exports = ${this.googExports};`;
    }

    this.manifest.addModule(
        this.outputIds.google3Path, this.outputIds.googModuleId);
    this.manifest.addReferencedModule(
        this.outputIds.google3Path, this.srcIds.googModuleId);

    const pintoModuleAnnotation = containsAtPintoModule(this.src) ?
        '@pintomodule found in original_file' :
        'pintomodule absent in original_file';

    return lines(
        '/**',
        ' * @fileoverview generator:ts_migration_exports_shim.ts',
        ' * original_file:' + this.srcIds.google3Path,
        ` * ${pintoModuleAnnotation}`,
        ' */',
        `goog.module('${this.outputIds.googModuleId}');`,
        mainModuleRequire,
        exportsAssignment,
        '',
    );
  }

  /**
   * Generate the .d.ts file that approximates what clutz would generate for the
   * file produced by generateTsmesJs.
   *
   * Since no JS library holds the generated JS file, clutz will never run over
   * that code. This .d.ts is needed for downstream TS libraries to know about
   * the shimmed export types.
   */
  private generateTsmesDts(): string {
    if (!this.outputIds || !this.googExports) {
      throw new Error();
    }

    const generatedFromComment = '// Generated from ' + this.srcIds.google3Path;

    const dependencyFileImports = lines(
        `declare module 'ಠ_ಠ.clutz._dependencies' {`,
        `  import '${this.srcIds.esModuleImportPath()}';`,
        `}`,
    );

    let clutzNamespaceDeclaration;
    let googColonModuleDeclaration;
    if (this.googExports instanceof Map) {
      // In the case that tsmes was passed named exports.

      const clutzNamespace = this.srcIds.clutzNamespace();
      const clutzNamespaceReexports =
          Array.from(this.googExports)
              .map(
                  ([k, v]) => `  export import ${k} = ${clutzNamespace}.${v};`);

      clutzNamespaceDeclaration = lines(
          generatedFromComment,
          `declare namespace ${this.outputIds.clutzNamespace()} {`,
          ...clutzNamespaceReexports,
          `}`,
      );
      googColonModuleDeclaration = lines(
          generatedFromComment,
          `declare module '${this.outputIds.clutzModuleId()}' {`,
          `  import x = ${this.outputIds.clutzNamespace()};`,
          `  export = x;`,
          `}`,
      );
    } else {
      // In the case that tsmes was passed a default export.

      clutzNamespaceDeclaration = lines(
          generatedFromComment,
          `declare namespace ಠ_ಠ.clutz {`,
          `  export import ${this.outputIds.googModuleRewrittenId()} =`,
          `      ${this.srcIds.clutzNamespace()}.${this.googExports};`,
          `}`,
      );
      googColonModuleDeclaration = lines(
          generatedFromComment,
          `declare module '${this.outputIds.clutzModuleId()}' {`,
          `  import x = ${this.outputIds.clutzNamespace()};`,
          `  export default x;`,
          `}`,
      );
    }

    return lines(
        '/**',
        ' * @fileoverview generator:ts_migration_exports_shim.ts',
        ' */',
        dependencyFileImports,
        clutzNamespaceDeclaration,
        googColonModuleDeclaration,
        '',
    );
  }

  private checkIsModuleExport(node: ts.Identifier, symbol: ts.Symbol|undefined):
      boolean {
    if (!symbol) {
      this.report(node, `could not resolve symbol of exported property`);
    } else if (this.mainExports.indexOf(symbol) === -1) {
      this.report(node, `export must be an exported symbol of the module`);
    } else {
      return true;
    }
    return false;
  }

  private report(
      node: ts.Node, messageText: string, textRange?: ts.TextRange,
      category = ts.DiagnosticCategory.Error): void {
    reportDiagnostic(this.diagnostics, node, messageText, textRange, category);
  }
}

/**
 * A simplified model of goog.module-style exports passed to tsmes.
 *
 * For exports of the form `exports = X`, it will be the string 'X'. For named
 * exports like `exports = {Public: Local}`, it will be the Map {'Public' =>
 * 'Local'}.
 */
type GoogExports = string|Map<string, string>;

function lines(...x: string[]): string {
  return x.join('\n');
}

interface TsmesCallBreakdown {
  googModuleId: string;
  googExports: GoogExports;
}

/**
 * The set of IDs associated with a single file.
 *
 * Each file can be identified in multiple ways, many of which are derivatives
 * of one another.
 */
class FileIdGroup {
  constructor(
      readonly google3Path: string,
      readonly googModuleId: string,
  ) {}

  google3PathWithoutExtension(): string {
    return stripSupportedExtensions(this.google3Path);
  }

  esModuleImportPath() {
    return 'google3/' + this.google3PathWithoutExtension();
  }

  googModuleRewrittenId(): string {
    return 'module$exports$' + this.googModuleId.replace(/\./g, '$');
  }

  clutzNamespace(): string {
    return 'ಠ_ಠ.clutz.' + this.googModuleRewrittenId();
  }

  clutzModuleId(): string {
    return 'goog:' + this.googModuleId;
  }
}

function containsAtPintoModule(file: ts.SourceFile): boolean {
  return /\s@pintomodule\s/.test(file.getFullText());
}
