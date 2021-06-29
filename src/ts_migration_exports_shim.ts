/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ModulesManifest} from './modules_manifest';
import {createGoogLoadedModulesRegistration, getGoogFunctionName, isAnyTsmesCall, isGoogCallExpressionOf, isTsmesShorthandCall, reportDiagnostic} from './transformer_util';

/** Provides dependencies for file generation. */
export interface TsMigrationExportsShimProcessorHost {
  /** Are tsMigrationExports calls allowed and should shim files be emitted? */
  generateTsMigrationExportsShim?: boolean;

  /** If true emit .legacy.closure.js file, else emit .legacy.d.ts */
  transformTypesToClosure?: boolean;

  /** See compiler_host.ts */
  pathToModuleName(context: string, importPath: string): string;

  /** See compiler_host.ts */
  rootDirsRelative(fileName: string): string;
}

/**
 * A map from google3 relative paths to shim file content.
 */
export type TsMigrationExportsShimFileMap = Map<string, string>;

/**
 * Creates a transformer that eliminates goog.tsMigration*ExportsShim (tsmes)
 * statements and generates appropriate shim file content.
 *
 * This transformation will always report an error if
 * `generateTsMigrationExportsShim` is false.
 *
 * If `transformTypesToClosure` is true:
 *   - tsmes calls are deleted
 *   - a "*.tsmes.closure.js" file is generated containing a goog.module that
 *     re-exports the specified exports from the input file
 * Else:
 *   - tsmes calls are replaced with insertions into the Closure debug module
 *     loader
 *   - a "*.tsmes.d.ts" file is generated containing Clutz-like re-exports of
 *     the specified exports from the input file
 */
export function createTsMigrationExportsShimTransformerFactory(
    typeChecker: ts.TypeChecker, host: TsMigrationExportsShimProcessorHost,
    manifest: ModulesManifest, tsickleDiagnostics: ts.Diagnostic[],
    outputFileMap: TsMigrationExportsShimFileMap):
    ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (src: ts.SourceFile): ts.SourceFile => {
      const result = new Generator(src, typeChecker, host, manifest).run();
      outputFileMap.set(result.filename, result.content);
      tsickleDiagnostics.push(...result.diagnostics);
      return result.transformedSrc;
    };
  };
}

function stripSupportedExtensions(path: string) {
  return path.replace(SUPPORTED_EXTENSIONS, '');
}

// .ts but not .d.ts
const SUPPORTED_EXTENSIONS = /(?<!\.d)\.ts$/;


/** A one-time-use object for running the tranformation. */
class Generator {
  private readonly diagnostics: ts.Diagnostic[] = [];
  private readonly mainExports: ts.Symbol[];
  private readonly srcIds: FileIdGroup;

  private tsmesBreakdown: TsmesCallBreakdown|undefined;
  private outputIds: FileIdGroup|undefined;

  constructor(
      private readonly src: ts.SourceFile,
      private readonly typeChecker: ts.TypeChecker,
      private readonly host: TsMigrationExportsShimProcessorHost,
      private readonly manifest: ModulesManifest,
  ) {
    const moduleSymbol = this.typeChecker.getSymbolAtLocation(this.src);
    this.mainExports =
        moduleSymbol ? this.typeChecker.getExportsOfModule(moduleSymbol) : [];

    const srcFilename = host.rootDirsRelative(src.fileName);
    const srcModuleId = host.pathToModuleName('', src.fileName);
    this.srcIds = new FileIdGroup(srcFilename, srcModuleId);
  }

  /**
   * Eliminates goog.tsMigration*ExportsShim (tsmes)
   * statements and generates appropriate shim file content.
   *
   * If `transformTypesToClosure` is true:
   *   - tsmes calls are deleted
   *   - a "*.tsmes.closure.js" file is generated containing a goog.module that
   *     re-exports the specified exports from the input file
   * Else:
   *   - tsmes calls are replaced with insertions into the Closure debug module
   *     loader
   *   - a "*.tsmes.d.ts" file is generated containing Clutz-like re-exports of
   *     the specified exports from the input file
   */
  run(): GeneratorResult {
    const outputFilename = this.srcIds.google3PathWithoutExtension() +
        (this.host.transformTypesToClosure ? '.tsmes.closure.js' :
                                             '.tsmes.d.ts');

    const tsmesBreakdown = this.extractTsmesStatement();
    if (!tsmesBreakdown) {
      return {
        filename: outputFilename,
        content: '',
        transformedSrc: this.src,
        diagnostics: this.diagnostics,
      };
    }

    this.tsmesBreakdown = tsmesBreakdown;
    this.outputIds =
        new FileIdGroup(outputFilename, tsmesBreakdown.googModuleId.text);

    return {
      filename: outputFilename,
      content: this.host.transformTypesToClosure ? this.generateTsmesJs() :
                                                   this.generateTsmesDts(),
      transformedSrc: this.transformSourceFile(),
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
    const startDiagnosticsCount = this.diagnostics.length;

    let tsmesCallStatement: ts.ExpressionStatement|undefined = undefined;
    for (const statement of this.src.statements) {
      if (!ts.isExpressionStatement(statement) ||
          !isAnyTsmesCall(statement.expression)) {
        this.checkNonTopLevelTsmesCalls(statement);
        continue;
      }

      if (tsmesCallStatement) {
        this.report(
            tsmesCallStatement,
            'at most one call to any of goog.tsMigrationExportsShim, ' +
                'goog.tsMigrationDefaultExportsShim, ' +
                'goog.tsMigrationNamedExportsShim is allowed per file');
      } else {
        tsmesCallStatement = statement;
      }
    }

    if (!tsmesCallStatement) {
      return undefined;
    } else if (!this.host.generateTsMigrationExportsShim) {
      this.report(
          tsmesCallStatement,
          'calls to goog.tsMigration*ExportsShim are not enabled. Did you' +
              ' remember to set generate_ts_migration_exports_shim?');
      return undefined;
    }
    const tsmesCall = tsmesCallStatement.expression as ts.CallExpression;

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
        throw new Error(`encountered unhandled goog.$fnName: ${fnName}`);
    }

    if (googExports === undefined) {
      if (startDiagnosticsCount >= this.diagnostics.length) {
        throw new Error(
            'googExports should be defined unless some diagnostic is reported.');
      }
      return undefined;
    }

    return {
      callStatement: tsmesCallStatement,
      googModuleId: moduleId,
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
    if (!this.outputIds || !this.tsmesBreakdown) {
      throw new Error('tsmes call must be extracted first');
    }

    const mainRequireImports = this.mainExports.map((e) => e.name).join(', ');
    const mainModuleRequire = `const { ${mainRequireImports} } = ` +
        `goog.require('${this.srcIds.googModuleId}');`;

    let exportsAssignment;
    if (this.tsmesBreakdown.googExports instanceof Map) {
      // In the case that tsmes was passed named exports.
      const bindings = Array.from(this.tsmesBreakdown.googExports)
                           .map(([k, v]) => `  ${k}: ${v},`);
      exportsAssignment = lines(
          `exports = {`,
          ...bindings,
          `};`,
      );
    } else {
      // In the case that tsmes was passed a default export.
      exportsAssignment = `exports = ${this.tsmesBreakdown.googExports};`;
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
    if (!this.outputIds || !this.tsmesBreakdown) {
      throw new Error('tsmes call must be extracted first');
    }

    const generatedFromComment = '// Generated from ' + this.srcIds.google3Path;

    const dependencyFileImports = lines(
        `declare module 'ಠ_ಠ.clutz._dependencies' {`,
        `  import '${this.srcIds.esModuleImportPath()}';`,
        `}`,
    );

    let clutzNamespaceDeclaration;
    let googColonModuleDeclaration;
    if (this.tsmesBreakdown.googExports instanceof Map) {
      // In the case that tsmes was passed named exports.

      const clutzNamespace = this.srcIds.clutzNamespace();
      const clutzNamespaceReexports =
          Array.from(this.tsmesBreakdown.googExports)
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
          `      ${this.srcIds.clutzNamespace()}.${
              this.tsmesBreakdown.googExports};`,
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

  /**
   * Rewrite the tsmes call into something that works in a goog.module.
   *
   * tsmes reexports some of the exports of the local TS module under a new
   * goog.module ID. This isn't possible with the public APIs, but we can make
   * it work at runtime by writing a record to goog.loadedModules_.
   *
   * This only works at runtime, and would fail if compiled by closure
   * compiler, but that's ok because we only transpile JS in development
   * mode.
   */
  private transformSourceFile(): ts.SourceFile {
    if (!this.outputIds || !this.tsmesBreakdown) {
      throw new Error('tsmes call must be extracted first');
    }

    const outputStatements = [...this.src.statements];
    const tsmesIndex =
        outputStatements.indexOf(this.tsmesBreakdown.callStatement);
    if (tsmesIndex < 0) {
      throw new Error('could not find tsmes call in file');
    }

    if (this.host.transformTypesToClosure) {
      // For Closure compilation code, just delete the tsmes call.
      outputStatements.splice(tsmesIndex, 1);
    } else {
      let exportsObj: ts.Expression;
      if (this.tsmesBreakdown.googExports instanceof Map) {
        // `{PublicName: PrivateName, ...}`
        const bindings =
            Array.from(this.tsmesBreakdown.googExports)
                .map(
                    ([k, v]) => ts.createPropertyAssignment(
                        ts.createIdentifier(k), ts.createIdentifier(v)));
        exportsObj = ts.createObjectLiteral(bindings);
      } else {
        exportsObj = ts.createIdentifier(this.tsmesBreakdown.googExports);
      }

      // For browser executable code, insert an entry for the shim module into
      // the debug loader module map.
      outputStatements.splice(
          tsmesIndex, 1,
          createGoogLoadedModulesRegistration(
              this.outputIds.googModuleId, exportsObj));
    }

    return ts.updateSourceFileNode(
        this.src,
        ts.setTextRange(
            ts.createNodeArray(outputStatements), this.src.statements));
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

  private report(node: ts.Node, messageText: string): void {
    reportDiagnostic(
        this.diagnostics, node, messageText, undefined,
        ts.DiagnosticCategory.Error);
  }
}

interface GeneratorResult {
  filename: string;
  content: string;
  transformedSrc: ts.SourceFile;
  diagnostics: ts.Diagnostic[];
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
  callStatement: ts.ExpressionStatement;
  googModuleId: ts.StringLiteral;
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
  const leadingTrivia =
      file.getFullText().substring(0, file.getLeadingTriviaWidth());
  return /\s@pintomodule\s/.test(leadingTrivia);
}
