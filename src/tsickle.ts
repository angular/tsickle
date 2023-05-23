/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AnnotatorHost} from './annotator_host';
import {assertAbsolute} from './cli_support';
import * as clutz from './clutz';
import {decoratorDownlevelTransformer} from './decorator_downlevel_transformer';
import {transformDecoratorJsdoc, transformDecoratorsOutputForClosurePropertyRenaming} from './decorators';
import {enumTransformer} from './enum_transformer';
import {generateExterns} from './externs';
import {transformFileoverviewCommentFactory} from './fileoverview_comment_transformer';
import * as googmodule from './googmodule';
import {jsdocTransformer, removeTypeAssertions} from './jsdoc_transformer';
import {ModulesManifest} from './modules_manifest';
import {namespaceTransformer} from './ns_transformer';
import {FileSummary, SummaryGenerationProcessorHost} from './summary';
import {isDtsFileName} from './transformer_util';
import * as tsmes from './ts_migration_exports_shim';
import {makeTsickleDeclarationMarkerTransformerFactory} from './tsickle_declaration_marker';

// Exported for users as a default impl of pathToModuleName.
export {pathToModuleName} from './cli_support';
// Retained here for API compatibility.
export {getGeneratedExterns} from './externs';
export {FileMap, ModulesManifest} from './modules_manifest';
export {FileSummary, ModuleType, Symbol, Type} from './summary';

export interface TsickleHost extends googmodule.GoogModuleProcessorHost,
                                     tsmes.TsMigrationExportsShimProcessorHost,
                                     AnnotatorHost,
                                     SummaryGenerationProcessorHost {
  /**
   * Whether to downlevel decorators
   */
  transformDecorators?: boolean;

  /**
   * Whether to convert types to closure
   */
  transformTypesToClosure?: boolean;

  /** Are tsMigrationExports calls allowed and should shim files be emitted? */
  generateTsMigrationExportsShim?: boolean;

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

  /**
   * Whether to convert CommonJS require() imports to goog.module() and
   * goog.require() calls.
   */
  googmodule: boolean;

  /**
   * Whether to transform declaration merging namespaces.
   */
  useDeclarationMergingTransformation?: boolean;

  /**
   * Whether to add suppressions by default.
   */
  generateExtraSuppressions: boolean;

  /**
   * Whether to generate summaries.
   */
  generateSummary?: boolean;
}


export function mergeEmitResults(emitResults: EmitResult[]): EmitResult {
  const diagnostics: ts.Diagnostic[] = [];
  let emitSkipped = true;
  const emittedFiles: string[] = [];
  const externs:
      {[fileName: string]: {output: string, moduleNamespace: string}} = {};
  const modulesManifest = new ModulesManifest();
  const tsMigrationExportsShimFiles = new Map<string, string>();
  const fileSummaries = new Map<string, FileSummary>();
  for (const er of emitResults) {
    diagnostics.push(...er.diagnostics);
    emitSkipped = emitSkipped || er.emitSkipped;
    if (er.emittedFiles) {
      emittedFiles.push(...er.emittedFiles);
    }
    Object.assign(externs, er.externs);
    modulesManifest.addManifest(er.modulesManifest);
    for (const [k, v] of er.tsMigrationExportsShimFiles) {
      tsMigrationExportsShimFiles.set(k, v);
    }
    for (const [k, v] of er.fileSummaries) {
      fileSummaries.set(k, v);
    }
  }

  return {
    diagnostics,
    emitSkipped,
    emittedFiles,
    externs,
    tsMigrationExportsShimFiles,
    modulesManifest,
    fileSummaries,
  };
}

export interface EmitResult extends ts.EmitResult {
  // The manifest of JS modules output by the compiler.
  modulesManifest: ModulesManifest;
  /**
   * externs.js files produced by tsickle, if any. module IDs are relative paths
   * from fileNameToModuleId.
   */
  externs: {[moduleId: string]: {output: string, moduleNamespace: string}};

  /**
   * Content for the generated files, keyed by their intended filename.
   * Filenames are google3 relative.
   */
  tsMigrationExportsShimFiles: tsmes.TsMigrationExportsShimFileMap;

  fileSummaries: Map<string, FileSummary>;
}

export interface EmitTransformers {
  /** Custom transformers to evaluate before built-in .js transformations. */
  beforeTs?: ts.CustomTransformers['before'];
  /** Custom transformers to evaluate after built-in .js transformations. */
  afterTs?: ts.CustomTransformers['after'];
  /** Custom transformers to evaluate after built-in .d.ts transformations. */
  afterDeclarations?: ts.CustomTransformers['afterDeclarations'];
}


/**
 * @deprecated Exposed for backward compat with Angular.  Use emit() instead.
 */
export function emitWithTsickle(
    program: ts.Program, host: TsickleHost, tsHost: ts.CompilerHost,
    tsOptions: ts.CompilerOptions, targetSourceFile?: ts.SourceFile,
    writeFile?: ts.WriteFileCallback, cancellationToken?: ts.CancellationToken,
    emitOnlyDtsFiles?: boolean,
    customTransformers: EmitTransformers = {}): EmitResult {
  return emit(
      program, host, writeFile || tsHost.writeFile.bind(tsHost),
      targetSourceFile, cancellationToken, emitOnlyDtsFiles,
      customTransformers);
}

export function emit(
    program: ts.Program, host: TsickleHost, writeFile: ts.WriteFileCallback,
    targetSourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken,
    emitOnlyDtsFiles?: boolean,
    customTransformers: EmitTransformers = {}): EmitResult {
  for (const sf of program.getSourceFiles()) {
    assertAbsolute(sf.fileName);
  }

  let tsickleDiagnostics: ts.Diagnostic[] = [];
  const typeChecker = program.getTypeChecker();
  const tsOptions = program.getCompilerOptions();
  if (!tsOptions.rootDir) {
    // Various places within tsickle assume rootDir is always present,
    // so return an error here if it wasn't provided.
    return {
      emitSkipped: false,
      diagnostics: [{
        category: ts.DiagnosticCategory.Error,
        code: 0,
        file: undefined,
        start: undefined,
        length: undefined,
        messageText: 'TypeScript options must specify rootDir',
      }],
      modulesManifest: new ModulesManifest(),
      externs: {},
      tsMigrationExportsShimFiles: new Map(),
      fileSummaries: new Map(),
    };
  }

  const modulesManifest = new ModulesManifest();
  const tsMigrationExportsShimFiles = new Map<string, string>();
  const tsickleSourceTransformers: Array<ts.TransformerFactory<ts.SourceFile>> =
      [];
  const fileSummaries = new Map<string, FileSummary>();
  tsickleSourceTransformers.push(
      tsmes.createTsMigrationExportsShimTransformerFactory(
          typeChecker, host, modulesManifest, tsickleDiagnostics,
          tsMigrationExportsShimFiles, fileSummaries));

  if (host.transformTypesToClosure) {
    // Only add @suppress {checkTypes} comments when also adding type
    // annotations.
    tsickleSourceTransformers.push(transformFileoverviewCommentFactory(
        tsOptions, tsickleDiagnostics, host.generateExtraSuppressions));
    if (host.useDeclarationMergingTransformation) {
      tsickleSourceTransformers.push(namespaceTransformer(
          host, tsOptions, typeChecker, tsickleDiagnostics));
    }
    tsickleSourceTransformers.push(
        jsdocTransformer(host, tsOptions, typeChecker, tsickleDiagnostics));
    tsickleSourceTransformers.push(enumTransformer(typeChecker));
  }
  if (host.transformDecorators) {
    tsickleSourceTransformers.push(
        decoratorDownlevelTransformer(typeChecker, tsickleDiagnostics));
  }
  const tsTransformers: ts.CustomTransformers = {
    before: [
      ...(tsickleSourceTransformers || [])
          .map(tf => skipTransformForSourceFileIfNeeded(host, tf)),
      ...(customTransformers.beforeTs || []),
    ],
    after: [...(customTransformers.afterTs || [])],
    afterDeclarations: [...(customTransformers.afterDeclarations || [])]
  };
  if (host.transformTypesToClosure) {
    // See comment on removeTypeAssertions.
    tsTransformers.before!.push(removeTypeAssertions());
  }
  if (host.googmodule) {
    tsTransformers.after!.push(googmodule.commonJsToGoogmoduleTransformer(
        host, modulesManifest, typeChecker));
    tsTransformers.after!.push(
        transformDecoratorsOutputForClosurePropertyRenaming(
            tsickleDiagnostics));
    tsTransformers.after!.push(transformDecoratorJsdoc());
  }
  if (host.addDtsClutzAliases) {
    tsTransformers.afterDeclarations!.push(
        clutz.makeDeclarationTransformerFactory(typeChecker, host));
  }

  // Adds a marker to the top of tsickle-generated .d.ts files, should always go
  // last
  tsTransformers.afterDeclarations!.push(
      makeTsickleDeclarationMarkerTransformerFactory(tsOptions));

  const {diagnostics: tsDiagnostics, emitSkipped, emittedFiles} = program.emit(
      targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles,
      tsTransformers);

  const externs:
      {[fileName: string]: {output: string, moduleNamespace: string}} = {};
  if (host.transformTypesToClosure) {
    const sourceFiles =
        targetSourceFile ? [targetSourceFile] : program.getSourceFiles();
    for (const sourceFile of sourceFiles) {
      const isDts = isDtsFileName(sourceFile.fileName);
      if (isDts && host.shouldSkipTsickleProcessing(sourceFile.fileName)) {
        continue;
      }
      const {output, diagnostics, moduleNamespace} =
          generateExterns(typeChecker, sourceFile, host);
      if (output) {
        externs[sourceFile.fileName] = {output, moduleNamespace};
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
    externs,
    tsMigrationExportsShimFiles,
    fileSummaries,
  };
}

function skipTransformForSourceFileIfNeeded(
    host: TsickleHost, delegateFactory: ts.TransformerFactory<ts.SourceFile>):
    ts.TransformerFactory<ts.SourceFile> {
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
