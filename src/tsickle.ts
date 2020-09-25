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
import {transformDecoratorsOutputForClosurePropertyRenaming} from './decorators';
import {enumTransformer} from './enum_transformer';
import {generateExterns} from './externs';
import {transformFileoverviewCommentFactory} from './fileoverview_comment_transformer';
import * as googmodule from './googmodule';
import {jsdocTransformer, removeTypeAssertions} from './jsdoc_transformer';
import {ModulesManifest} from './modules_manifest';
import {isDtsFileName} from './transformer_util';

// Exported for users as a default impl of pathToModuleName.
export {pathToModuleName} from './cli_support';
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
    if (er.emittedFiles) {
      emittedFiles.push(...er.emittedFiles);
    }
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
  /** Custom transformers to evaluate before Tsickle .js transformations. */
  beforeTsickle?: ts.CustomTransformers['before'];
  /** Custom transformers to evaluate before built-in .js transformations. */
  beforeTs?: ts.CustomTransformers['before'];
  /** Custom transformers to evaluate after built-in .js transformations. */
  afterTs?: ts.CustomTransformers['after'];
  /** Custom transformers to evaluate after built-in .d.ts transformations. */
  afterDeclarations?: ts.CustomTransformers['afterDeclarations'];
}


/** @deprecated Exposed for backward compat with Angular.  Use emit() instead. */
export function emitWithTsickle(
    program: ts.Program, host: TsickleHost, tsHost: ts.CompilerHost, tsOptions: ts.CompilerOptions,
    targetSourceFile?: ts.SourceFile, writeFile?: ts.WriteFileCallback,
    cancellationToken?: ts.CancellationToken, emitOnlyDtsFiles?: boolean,
    customTransformers: EmitTransformers = {}): EmitResult {
  return emit(
      program, host, writeFile || tsHost.writeFile.bind(tsHost), targetSourceFile,
      cancellationToken, emitOnlyDtsFiles, customTransformers);
}

export function emit(
    program: ts.Program, host: TsickleHost, writeFile: ts.WriteFileCallback,
    targetSourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken,
    emitOnlyDtsFiles?: boolean, customTransformers: EmitTransformers = {}): EmitResult {
  for (const sf of program.getSourceFiles()) {
    assertAbsolute(sf.fileName);
  }

  let tsickleDiagnostics: ts.Diagnostic[] = [];
  const typeChecker = program.getTypeChecker();
  const tsOptions = program.getCompilerOptions();
  const tsickleSourceTransformers: Array<ts.TransformerFactory<ts.SourceFile>> = [];
  if (host.transformTypesToClosure) {
    // Only add @suppress {checkTypes} comments when also adding type annotations.
    tsickleSourceTransformers.push(
        transformFileoverviewCommentFactory(tsOptions, tsickleDiagnostics));
    tsickleSourceTransformers.push(
        jsdocTransformer(host, tsOptions, typeChecker, tsickleDiagnostics));
    tsickleSourceTransformers.push(enumTransformer(typeChecker, tsickleDiagnostics));
  }
  if (host.transformDecorators) {
    tsickleSourceTransformers.push(decoratorDownlevelTransformer(typeChecker, tsickleDiagnostics));
  }
  const modulesManifest = new ModulesManifest();
  const tsTransformers: ts.CustomTransformers = {
    before: [
      ...(customTransformers.beforeTsickle || []),
      ...(tsickleSourceTransformers || [])
          .map(tf => skipTransformForSourceFileIfNeeded(host, tf)),
      ...(customTransformers.beforeTs || []),
    ],
    after: [...(customTransformers.afterTs || [])],
    afterDeclarations: [...(customTransformers.afterDeclarations || [])]
  };
  if (host.transformTypesToClosure) {
    // See comment on remoteTypeAssertions.
    tsTransformers.before!.push(removeTypeAssertions());
  }
  if (host.googmodule) {
    tsTransformers.after!.push(
        googmodule.commonJsToGoogmoduleTransformer(host, modulesManifest, typeChecker));
    tsTransformers.after!.push(
        transformDecoratorsOutputForClosurePropertyRenaming(tsickleDiagnostics));
  }
  if (host.addDtsClutzAliases) {
    tsTransformers.afterDeclarations!.push(
        clutz.makeDeclarationTransformerFactory(
            typeChecker, (path: string) => host.pathToModuleName('', path)));
  }

  const {diagnostics: tsDiagnostics, emitSkipped, emittedFiles} = program.emit(
      targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles,
      tsTransformers);

  const externs: {[fileName: string]: string} = {};
  if (host.transformTypesToClosure) {
    const sourceFiles = targetSourceFile ? [targetSourceFile] : program.getSourceFiles();
    for (const sourceFile of sourceFiles) {
      const isDts = isDtsFileName(sourceFile.fileName);
      if (isDts && host.shouldSkipTsickleProcessing(sourceFile.fileName)) {
        continue;
      }
      const {output, diagnostics} = generateExterns(
          typeChecker, sourceFile, host, host.moduleResolutionHost, program.getCompilerOptions());
      if (output) {
        externs[sourceFile.fileName] = output;
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
