/**
 * @fileoverview
 * @suppress {untranspilableFeatures} ES2018 feature "RegExp named groups"
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ModulesManifest} from './modules_manifest';
import {FileSummary, ModuleType, Type} from './summary';
import {getGoogFunctionName, isAnyTsmesCall, isGoogCallExpressionOf, isTsmesDeclareLegacyNamespaceCall, isTsmesShorthandCall, reportDiagnostic} from './transformer_util';

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
 * statements and generates appropriate shim file content. If requested in the
 * TypeScript compiler options, it will also produce a `.d.ts` file.
 *
 * Files are stored in outputFileMap, the caller must make sure to emit them.
 *
 * This transformation will always report an error if
 * `generateTsMigrationExportsShim` is false.
 */
export function createTsMigrationExportsShimTransformerFactory(
    typeChecker: ts.TypeChecker, host: TsMigrationExportsShimProcessorHost,
    manifest: ModulesManifest, tsickleDiagnostics: ts.Diagnostic[],
    outputFileMap: TsMigrationExportsShimFileMap,
    fileSummaries: Map<string, FileSummary>):
    ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (src: ts.SourceFile): ts.SourceFile => {
      const srcFilename = host.rootDirsRelative(src.fileName);
      const srcModuleId = host.pathToModuleName('', src.fileName);
      const srcIds = new FileIdGroup(srcFilename, srcModuleId);

      const generator = new Generator(
          src, srcIds, typeChecker, host, manifest, tsickleDiagnostics);
      const tsmesFile = srcIds.google3PathWithoutExtension() + '.tsmes.js';
      const dtsFile = srcIds.google3PathWithoutExtension() + '.tsmes.d.ts';
      if (!host.generateTsMigrationExportsShim) {
        // we need to create the Generator to make sure there aren't any shim
        // related function calls if generateTsMigrationExportsShim isn't true,
        // but we don't want to actually write any files, so return
        return src;
      }
      if (!generator.foundMigrationExportsShim()) {
        // If there is no export shims calls, we still need to generate empty
        // files, so that we always produce a predictable set of files.
        // TODO(martinprobst): the empty files might cause issues with code
        // that should be in mods or modules.
        outputFileMap.set(tsmesFile, '');
        const fileSummary = new FileSummary();
        fileSummary.moduleType = ModuleType.UNKNOWN;
        fileSummaries.set(tsmesFile, fileSummary);
        if (context.getCompilerOptions().declaration) {
          outputFileMap.set(dtsFile, '');
        }
        return src;
      }
      const [content, fileSummary] = generator.generateExportShimJavaScript();
      outputFileMap.set(tsmesFile, content);
      fileSummaries.set(tsmesFile, fileSummary);
      if (context.getCompilerOptions().declaration) {
        const dtsResult = generator.generateExportShimDeclarations();
        outputFileMap.set(dtsFile, dtsResult);
      }
      return generator.transformSourceFile();
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
  private readonly mainExports: ts.Symbol[];

  private readonly tsmesBreakdown: TsmesCallBreakdown|undefined;
  private readonly outputIds: FileIdGroup|undefined;

  constructor(
      private readonly src: ts.SourceFile,
      private readonly srcIds: FileIdGroup,
      private readonly typeChecker: ts.TypeChecker,
      private readonly host: TsMigrationExportsShimProcessorHost,
      private readonly manifest: ModulesManifest,
      private readonly diagnostics: ts.Diagnostic[],
  ) {
    // TODO(martinprobst): Generator is only partially initialized in its
    // constructor and the object is unusable in case no shim call is found,
    // with all subsequent methods checking whether it was initialized.
    // Instead, extractTsmesStatement should construct this generator object (or
    // return undefined if none), which would then encapsulate state that's
    // guaranteed to be initialized (no more |undefined).
    const moduleSymbol = this.typeChecker.getSymbolAtLocation(this.src);
    this.mainExports =
        moduleSymbol ? this.typeChecker.getExportsOfModule(moduleSymbol) : [];

    const outputFilename =
        this.srcIds.google3PathWithoutExtension() + '.tsmes.closure.js';

    this.tsmesBreakdown = this.extractTsmesStatement();
    if (this.tsmesBreakdown) {
      this.outputIds = new FileIdGroup(
          outputFilename, this.tsmesBreakdown.googModuleId.text);
    }
  }

  /**
   * Returns whether there were any migration exports shim calls in the source
   * file.
   */
  foundMigrationExportsShim() {
    return !!this.tsmesBreakdown;
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
    let tsmesDlnCallStatement: ts.ExpressionStatement|undefined = undefined;
    for (const statement of this.src.statements) {
      const isTsmesCall = ts.isExpressionStatement(statement) &&
          isAnyTsmesCall(statement.expression);
      const isTsmesDlnCall = ts.isExpressionStatement(statement) &&
          isTsmesDeclareLegacyNamespaceCall(statement.expression);
      if (!isTsmesCall && !isTsmesDlnCall) {
        this.checkNonTopLevelTsmesCalls(statement);
        continue;
      }

      if (isTsmesCall) {
        if (tsmesCallStatement) {
          this.report(
              tsmesCallStatement,
              'at most one call to any of goog.tsMigrationExportsShim, ' +
                  'goog.tsMigrationDefaultExportsShim, ' +
                  'goog.tsMigrationNamedExportsShim is allowed per file');
        } else {
          tsmesCallStatement = statement;
        }
      } else if (isTsmesDlnCall) {
        if (tsmesDlnCallStatement) {
          this.report(
              tsmesDlnCallStatement,
              'at most one call to ' +
                  'goog.tsMigrationExportsShimDeclareLegacyNamespace ' +
                  'is allowed per file');
        } else {
          tsmesDlnCallStatement = statement;
        }
      }
    }

    if (!tsmesCallStatement) {
      if (tsmesDlnCallStatement) {
        this.report(
            tsmesDlnCallStatement,
            'goog.tsMigrationExportsShimDeclareLegacyNamespace requires a ' +
                'goog.tsMigration*ExportsShim call as well');
        return undefined;
      }
      return undefined;
    } else if (!this.host.generateTsMigrationExportsShim) {
      this.report(
          tsmesCallStatement,
          'calls to goog.tsMigration*ExportsShim are not enabled. Please set' +
              ' generate_ts_migration_exports_shim = True' +
              ' in the BUILD file to enable this feature.');
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
      declareLegacyNamespaceStatement: tsmesDlnCallStatement,
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
      if (isAnyTsmesCall(node) || isTsmesDeclareLegacyNamespaceCall(node)) {
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
   *
   * NOTE: This code must be written to be compatible as-is with IE11.
   */
  generateExportShimJavaScript(): [string, FileSummary] {
    if (!this.outputIds || !this.tsmesBreakdown) {
      throw new Error('tsmes call must be extracted first');
    }

    let maybeDeclareLegacyNameCall: string|undefined = undefined;
    if (this.tsmesBreakdown.declareLegacyNamespaceStatement) {
      maybeDeclareLegacyNameCall = 'goog.module.declareLegacyNamespace();';
    }

    // Note: We don't do a destructure here as that's not compatible with IE11.
    const mainModuleRequire =
        `var mainModule = goog.require('${this.srcIds.googModuleId}');`;

    let exportsAssignment: string;
    if (this.tsmesBreakdown.googExports instanceof Map) {
      // In the case that tsmes was passed named exports.
      const exports = Array.from(this.tsmesBreakdown.googExports)
                           .map(([k, v]) => `exports.${k} = mainModule.${v};`);
      exportsAssignment = lines(...exports);
    } else {
      // In the case that tsmes was passed a default export.
      exportsAssignment =
          `exports = mainModule.${this.tsmesBreakdown.googExports};`;
    }

    this.manifest.addModule(
        this.outputIds.google3Path, this.outputIds.googModuleId);
    this.manifest.addReferencedModule(
        this.outputIds.google3Path, this.srcIds.googModuleId);

    const isAutoChunk = containsAtPintoModule(this.src);
    const pintoModuleAnnotation = isAutoChunk ?
        '@pintomodule found in original_file' :
        'pintomodule absent in original_file';

    const content = lines(
        '/**',
        ' * @fileoverview generator:ts_migration_exports_shim.ts',
        ' * original_file:' + this.srcIds.google3Path,
        ` * ${pintoModuleAnnotation}`,
        ' */',
        `goog.module('${this.outputIds.googModuleId}');`,
        maybeDeclareLegacyNameCall,
        mainModuleRequire,
        exportsAssignment,
        '',
    );

    const fileSummary = new FileSummary();
    fileSummary.addProvide(
        {type: Type.CLOSURE, name: this.outputIds.googModuleId});
    fileSummary.addStrongRequire({type: Type.CLOSURE, name: 'goog'});
    fileSummary.addStrongRequire(
        {type: Type.CLOSURE, name: this.srcIds.googModuleId});

    fileSummary.autochunk = isAutoChunk;
    fileSummary.moduleType = ModuleType.GOOG_MODULE;

    return [content, fileSummary];
  }

  /**
   * Generate the .d.ts file that approximates what clutz would generate for the
   * file produced by generateTsmesJs.
   *
   * Since no JS library holds the generated JS file, clutz will never run over
   * that code. This .d.ts is needed for downstream TS libraries to know about
   * the shimmed export types.
   */
  generateExportShimDeclarations(): string {
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
   * Strips the goog.tsMigrationNamedExportsShim (etc) calls from source file.
   */
  transformSourceFile(): ts.SourceFile {
    if (!this.outputIds || !this.tsmesBreakdown) {
      throw new Error('tsmes call must be extracted first');
    }

    const outputStatements = [...this.src.statements];
    const tsmesIndex =
        outputStatements.indexOf(this.tsmesBreakdown.callStatement);
    if (tsmesIndex < 0) {
      throw new Error('could not find tsmes call in file');
    }

    // Just delete the tsmes call.
    outputStatements.splice(tsmesIndex, 1);

    if (this.tsmesBreakdown.declareLegacyNamespaceStatement) {
      const dlnIndex = outputStatements.indexOf(
          this.tsmesBreakdown.declareLegacyNamespaceStatement);
      if (dlnIndex < 0) {
        throw new Error(
            'could not find the tsmes declareLegacyNamespace call in file');
      }

      // Also delete the tsmes declareLegacyNamespace call.
      outputStatements.splice(dlnIndex, 1);
    }

    return ts.factory.updateSourceFile(
        this.src,
        ts.setTextRange(
            ts.factory.createNodeArray(outputStatements), this.src.statements));
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

/**
 * A simplified model of goog.module-style exports passed to tsmes.
 *
 * For exports of the form `exports = X`, it will be the string 'X'. For named
 * exports like `exports = {Public: Local}`, it will be the Map {'Public' =>
 * 'Local'}.
 */
type GoogExports = string|Map<string, string>;

function lines(...lines: Array<string|undefined>): string {
  return lines.filter(line => line != null).join('\n');
}

interface TsmesCallBreakdown {
  callStatement: ts.ExpressionStatement;
  googModuleId: ts.StringLiteral;
  googExports: GoogExports;
  declareLegacyNamespaceStatement?: ts.ExpressionStatement;
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
