/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {decoratorDownlevelTransformer} from './decorator_downlevel_transformer';
import {enumTransformer} from './enum_transformer';
import {generateExterns} from './externs';
import {transformFileoverviewCommentFactory} from './fileoverview_comment_transformer';
import * as googmodule from './googmodule';
import {AnnotatorHost, jsdocTransformer, removeTypeAssertions} from './jsdoc_transformer';
import {ModulesManifest} from './modules_manifest';
import {quotingTransformer} from './quoting_transformer';
import {isDtsFileName} from './transformer_util';
import * as ts from './typescript';
// Retained here for API compatibility.
export {getGeneratedExterns} from './externs';

export {FileMap, ModulesManifest} from './modules_manifest';

export interface TsickleHost extends googmodule.GoogModuleProcessorHost, AnnotatorHost {
  /**
   * Whether to downlevel decorators
   */
  transformDecorators?: boolean;
  /**
   * Whether to convers types to closure
   */
  transformTypesToClosure?: boolean;
  /**
   * Whether to add aliases to the .d.ts files to add the exports to the
   * ಠ_ಠ.clutz namespace.
   */
  addDtsClutzAliases?: boolean;
  /**
   * If true, tsickle and decorator downlevel processing will be skipped for
   * that file.
   */
  shouldSkipTsickleProcessing(fileName: string): boolean;
  /**
   * Tsickle treats warnings as errors, if true, ignore warnings.  This might be
   * useful for e.g. third party code.
   */
  shouldIgnoreWarningsForPath(filePath: string): boolean;
  /** Whether to convert CommonJS require() imports to goog.module() and goog.require() calls. */
  googmodule: boolean;
}

export function mergeEmitResults(emitResults: EmitResult[]): EmitResult {
  const diagnostics: ts.Diagnostic[] = [];
  let emitSkipped = true;
  const emittedFiles: string[] = [];
  const externs: {[fileName: string]: string} = {};
  const modulesManifest = new ModulesManifest();
  for (const er of emitResults) {
    diagnostics.push(...er.diagnostics);
    emitSkipped = emitSkipped || er.emitSkipped;
    emittedFiles.push(...er.emittedFiles);
    Object.assign(externs, er.externs);
    modulesManifest.addManifest(er.modulesManifest);
  }
  return {diagnostics, emitSkipped, emittedFiles, externs, modulesManifest};
}

export interface EmitResult extends ts.EmitResult {
  // The manifest of JS modules output by the compiler.
  modulesManifest: ModulesManifest;
  /**
   * externs.js files produced by tsickle, if any. module IDs are relative paths from
   * fileNameToModuleId.
   */
  externs: {[moduleId: string]: string};
}

export interface EmitTransformers {
  beforeTsickle?: Array<ts.TransformerFactory<ts.SourceFile>>;
  beforeTs?: Array<ts.TransformerFactory<ts.SourceFile>>;
  afterTs?: Array<ts.TransformerFactory<ts.SourceFile>>;
}

export function emitWithTsickle(
    program: ts.Program, host: TsickleHost, tsHost: ts.CompilerHost, tsOptions: ts.CompilerOptions,
    targetSourceFile?: ts.SourceFile, writeFile?: ts.WriteFileCallback,
    cancellationToken?: ts.CancellationToken, emitOnlyDtsFiles?: boolean,
    customTransformers: EmitTransformers = {}): EmitResult {
  let tsickleDiagnostics: ts.Diagnostic[] = [];
  const typeChecker = program.getTypeChecker();
  const tsickleSourceTransformers: Array<ts.TransformerFactory<ts.SourceFile>> = [];
  if (host.transformTypesToClosure) {
    // Only add @suppress {checkTypes} comments when also adding type annotations.
    tsickleSourceTransformers.push(transformFileoverviewCommentFactory(tsickleDiagnostics));
    tsickleSourceTransformers.push(
        jsdocTransformer(host, tsOptions, tsHost, typeChecker, tsickleDiagnostics));
    if (!host.disableAutoQuoting) {
      tsickleSourceTransformers.push(quotingTransformer(host, typeChecker, tsickleDiagnostics));
    }
    tsickleSourceTransformers.push(enumTransformer(typeChecker, tsickleDiagnostics));
    tsickleSourceTransformers.push(decoratorDownlevelTransformer(typeChecker, tsickleDiagnostics));
  } else if (host.transformDecorators) {
    tsickleSourceTransformers.push(decoratorDownlevelTransformer(typeChecker, tsickleDiagnostics));
  }
  const modulesManifest = new ModulesManifest();
  const tsickleTransformers: ts.CustomTransformers = {before: tsickleSourceTransformers};
  const tsTransformers: ts.CustomTransformers = {
    before: [
      ...(customTransformers.beforeTsickle || []),
      ...(tsickleTransformers.before || []).map(tf => skipTransformForSourceFileIfNeeded(host, tf)),
      ...(customTransformers.beforeTs || []),
    ],
    after: [
      ...(customTransformers.afterTs || []),
      ...(tsickleTransformers.after || []).map(tf => skipTransformForSourceFileIfNeeded(host, tf)),
    ]
  };
  if (host.transformTypesToClosure) {
    // See comment on remoteTypeAssertions.
    tsTransformers.before!.push(removeTypeAssertions());
  }
  if (host.googmodule) {
    tsTransformers.after!.push(googmodule.commonJsToGoogmoduleTransformer(
        host, modulesManifest, typeChecker, tsickleDiagnostics));
  }

  const writeFileDelegate: ts.WriteFileCallback = writeFile || tsHost.writeFile.bind(tsHost);
  const writeFileImpl =
      (fileName: string, content: string, writeByteOrderMark: boolean,
       onError: ((message: string) => void)|undefined,
       sourceFiles: ReadonlyArray<ts.SourceFile>) => {
        if (host.addDtsClutzAliases && isDtsFileName(fileName) && sourceFiles) {
          // Only bundle emits pass more than one source file for .d.ts writes. Bundle emits however
          // are not supported by tsickle, as we cannot annotate them for Closure in any meaningful
          // way anyway.
          if (!sourceFiles || sourceFiles.length > 1) {
            throw new Error(`expected exactly one source file for .d.ts emit, got ${
                sourceFiles.map(sf => sf.fileName)}`);
          }
          const originalSource = sourceFiles[0];
          content = addClutzAliases(fileName, content, originalSource, typeChecker, host);
        }
        writeFileDelegate(fileName, content, writeByteOrderMark, onError, sourceFiles);
      };

  const {diagnostics: tsDiagnostics, emitSkipped, emittedFiles} = program.emit(
      targetSourceFile, writeFileImpl, cancellationToken, emitOnlyDtsFiles, tsTransformers);

  const externs: {[fileName: string]: string} = {};
  if (host.transformTypesToClosure) {
    const sourceFiles = targetSourceFile ? [targetSourceFile] : program.getSourceFiles();
    for (const sourceFile of sourceFiles) {
      const isDts = isDtsFileName(sourceFile.fileName);
      if (isDts && host.shouldSkipTsickleProcessing(sourceFile.fileName)) {
        continue;
      }
      // fileName might be absolute, which would cause emits different by checkout location or
      // non-deterministic output for build systems that use hashed work directories (bazel).
      // fileNameToModuleId gives the logical, base path relative ID for the given fileName, which
      // avoids this issue.
      const moduleId = host.fileNameToModuleId(sourceFile.fileName);
      const {output, diagnostics} = generateExterns(
          typeChecker, sourceFile, host, /* moduleResolutionHost */ host.host, tsOptions);
      if (output) {
        externs[moduleId] = output;
      }
      if (diagnostics) {
        tsickleDiagnostics.push(...diagnostics);
      }
    }
  }
  // All diagnostics (including warnings) are treated as errors.
  // If the host decides to ignore warnings, just discard them.
  // Warnings include stuff like "don't use @type in your jsdoc"; tsickle
  // warns and then fixes up the code to be Closure-compatible anyway.
  tsickleDiagnostics = tsickleDiagnostics.filter(
      d => d.category === ts.DiagnosticCategory.Error ||
          !host.shouldIgnoreWarningsForPath(d.file!.fileName));

  return {
    modulesManifest,
    emitSkipped,
    emittedFiles: emittedFiles || [],
    diagnostics: [...tsDiagnostics, ...tsickleDiagnostics],
    externs
  };
}

/** Compares two strings and returns a number suitable for use in sort(). */
function stringCompare(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * A tsickle produced declaration file might be consumed be referenced by Clutz
 * produced .d.ts files, which use symbol names based on Closure's internal
 * naming conventions, so we need to provide aliases for all the exported symbols
 * in the Clutz naming convention.
 */
function addClutzAliases(
    fileName: string, dtsFileContent: string, sourceFile: ts.SourceFile,
    typeChecker: ts.TypeChecker, host: TsickleHost): string {
  const moduleSymbol = typeChecker.getSymbolAtLocation(sourceFile);
  const moduleExports = moduleSymbol && typeChecker.getExportsOfModule(moduleSymbol);
  if (!moduleExports) return dtsFileContent;

  // .d.ts files can be transformed, too, so we need to compare the original node below.
  const origSourceFile = ts.getOriginalNode(sourceFile);
  // The module exports might be re-exports, and in the case of "export *" might not even be
  // available in the module scope, which makes them difficult to export. Avoid the problem by
  // filtering out symbols who do not have a declaration in the local module.
  const localExports = moduleExports.filter(e => {
    // If there are no declarations, be conservative and emit the aliases.
    if (!e.declarations) return true;
    // Skip default exports, they are not currently supported.
    // default is a keyword in typescript, so the name of the export being default means that it's a
    // default export.
    if (e.name === 'default') return false;
    // Otherwise check that some declaration is from the local module.
    return e.declarations.some(d => d.getSourceFile() === origSourceFile);
  });
  if (!localExports.length) return dtsFileContent;

  // TypeScript 2.8 and TypeScript 2.9 differ on the order in which the
  // module symbols come out, so sort here to make the tests stable.
  localExports.sort((a, b) => stringCompare(a.name, b.name));

  const moduleName = host.pathToModuleName('', sourceFile.fileName);
  const clutzModuleName = moduleName.replace(/\./g, '$');

  // Clutz might refer to the name in two different forms (stemming from goog.provide and
  // goog.module respectively).
  // 1) global in clutz:   ಠ_ಠ.clutz.module$contents$path$to$module_Symbol...
  // 2) local in a module: ಠ_ಠ.clutz.module$exports$path$to$module.Symbol ..
  // See examples at:
  // https://github.com/angular/clutz/tree/master/src/test/java/com/google/javascript/clutz

  // Case (1) from above.
  let globalSymbols = '';
  // Case (2) from above.
  let nestedSymbols = '';
  for (const symbol of localExports) {
    globalSymbols +=
        `\t\texport {${symbol.name} as module$contents$${clutzModuleName}_${symbol.name}}\n`;
    nestedSymbols +=
        `\t\texport {module$contents$${clutzModuleName}_${symbol.name} as ${symbol.name}}\n`;
    if (symbol.flags & ts.SymbolFlags.Class) {
      globalSymbols += `\t\texport {${symbol.name} as module$contents$${clutzModuleName}_${
          symbol.name}_Instance}\n`;
      nestedSymbols += `\t\texport {module$contents$${clutzModuleName}_${symbol.name} as ${
          symbol.name}_Instance}\n`;
    }
  }

  dtsFileContent += 'declare global {\n';
  dtsFileContent += `\tnamespace ಠ_ಠ.clutz {\n`;
  dtsFileContent += globalSymbols;
  dtsFileContent += `\t}\n`;
  dtsFileContent += `\tnamespace ಠ_ಠ.clutz.module$exports$${clutzModuleName} {\n`;
  dtsFileContent += nestedSymbols;
  dtsFileContent += `\t}\n`;
  dtsFileContent += '}\n';

  return dtsFileContent;
}

function skipTransformForSourceFileIfNeeded(
    host: TsickleHost,
    delegateFactory: ts.TransformerFactory<ts.SourceFile>): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    const delegate = delegateFactory(context);
    return (sourceFile: ts.SourceFile) => {
      if (host.shouldSkipTsickleProcessing(sourceFile.fileName)) {
        return sourceFile;
      }
      return delegate(sourceFile);
    };
  };
}
