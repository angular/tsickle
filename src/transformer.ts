/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import {RawSourceMap, SourceMapConsumer, SourceMapGenerator} from 'source-map';
import * as ts from 'typescript';

import * as decorator from './decorator-annotator';
import * as es5processor from './es5processor';
import {ModulesManifest} from './modules_manifest';
import {containsInlineSourceMap, extractInlineSourceMap, parseSourceMap, removeInlineSourceMap, setInlineSourceMap, SourceMapper, SourcePosition} from './source_map_utils';
import {createTransformerFromSourceMap} from './transformer_sourcemap';
import {createCustomTransformers} from './transformer_util';
import * as tsickle from './tsickle';

export interface TransformerOptions extends es5processor.Es5ProcessorOptions, tsickle.Options {
  /**
   * Whether to downlevel decorators
   */
  transformDecorators?: boolean;
  /**
   * Whether to convers types to closure
   */
  transformTypesToClosure?: boolean;
}

export interface TransformerHost extends es5processor.Es5ProcessorHost, tsickle.AnnotatorHost {
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
  /** externs.js files produced by tsickle, if any. */
  externs: {[fileName: string]: string};
}

export interface EmitTransformers {
  beforeTsickle?: Array<ts.TransformerFactory<ts.SourceFile>>;
  beforeTs?: Array<ts.TransformerFactory<ts.SourceFile>>;
  afterTs?: Array<ts.TransformerFactory<ts.SourceFile>>;
}

export function emitWithTsickle(
    program: ts.Program, host: TransformerHost, options: TransformerOptions,
    tsHost: ts.CompilerHost, tsOptions: ts.CompilerOptions, targetSourceFile?: ts.SourceFile,
    writeFile?: ts.WriteFileCallback, cancellationToken?: ts.CancellationToken,
    emitOnlyDtsFiles?: boolean, customTransformers?: EmitTransformers): EmitResult {
  let tsickleDiagnostics: ts.Diagnostic[] = [];
  const typeChecker = program.getTypeChecker();
  const beforeTsTransformers: Array<ts.TransformerFactory<ts.SourceFile>> = [];
  // add tsickle transformers
  if (options.transformTypesToClosure) {
    // Note: tsickle.annotate can also lower decorators in the same run.
    beforeTsTransformers.push(createTransformerFromSourceMap((sourceFile, sourceMapper) => {
      const tisckleOptions: tsickle.Options = {...options, filterTypesForExport: true};
      const {output, diagnostics} = tsickle.annotate(
          typeChecker, sourceFile, host, tisckleOptions, tsHost, tsOptions, sourceMapper,
          tsickle.AnnotatorFeatures.Transformer);
      tsickleDiagnostics.push(...diagnostics);
      return output;
    }));
  } else if (options.transformDecorators) {
    beforeTsTransformers.push(createTransformerFromSourceMap((sourceFile, sourceMapper) => {
      const {output, diagnostics} =
          decorator.convertDecorators(typeChecker, sourceFile, sourceMapper);
      tsickleDiagnostics.push(...diagnostics);
      return output;
    }));
  }
  // // For debugging: transformer that just emits the same text.
  // beforeTsTransformers.push(createTransformer(host, typeChecker, (sourceFile, sourceMapper) => {
  //   sourceMapper.addMapping(sourceFile, {position: 0, line: 0, column: 0}, {position: 0, line: 0,
  //   column: 0}, sourceFile.text.length); return sourceFile.text;
  // }));
  // add user supplied transformers
  const afterTsTransformers: Array<ts.TransformerFactory<ts.SourceFile>> = [];
  if (customTransformers) {
    if (customTransformers.beforeTsickle) {
      beforeTsTransformers.unshift(...customTransformers.beforeTsickle);
    }

    if (customTransformers.beforeTs) {
      beforeTsTransformers.push(...customTransformers.beforeTs);
    }
    if (customTransformers.afterTs) {
      afterTsTransformers.push(...customTransformers.afterTs);
    }
  }
  customTransformers = createCustomTransformers({
    before: beforeTsTransformers.map(tf => skipTransformForSourceFileIfNeeded(host, tf)),
    after: afterTsTransformers.map(tf => skipTransformForSourceFileIfNeeded(host, tf))
  });

  const writeFileDelegate = writeFile || tsHost.writeFile.bind(tsHost);
  const modulesManifest = new ModulesManifest();
  const writeFileImpl =
      (fileName: string, content: string, writeByteOrderMark: boolean,
       onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]) => {
        if (path.extname(fileName) !== '.map') {
          if (tsOptions.inlineSourceMap) {
            content = combineInlineSourceMaps(program, fileName, content);
          } else {
            content = removeInlineSourceMap(content);
          }
          content = es5processor.convertCommonJsToGoogModuleIfNeeded(
              host, options, modulesManifest, fileName, content);
        } else {
          content = combineSourceMaps(program, fileName, content);
        }
        writeFileDelegate(fileName, content, writeByteOrderMark, onError, sourceFiles);
      };

  const {diagnostics: tsDiagnostics, emitSkipped, emittedFiles} = program.emit(
      targetSourceFile, writeFileImpl, cancellationToken, emitOnlyDtsFiles, customTransformers);

  const externs: {[fileName: string]: string} = {};
  if (options.transformTypesToClosure) {
    const sourceFiles = targetSourceFile ? [targetSourceFile] : program.getSourceFiles();
    sourceFiles.forEach(sf => {
      if (tsickle.isDtsFileName(sf.fileName) && host.shouldSkipTsickleProcessing(sf.fileName)) {
        return;
      }
      const {output, diagnostics} = tsickle.writeExterns(typeChecker, sf, host, options);
      if (output) {
        externs[sf.fileName] = output;
      }
      if (diagnostics) {
        tsickleDiagnostics.push(...diagnostics);
      }
    });
  }
  // All diagnostics (including warnings) are treated as errors.
  // If the host decides to ignore warnings, just discard them.
  // Warnings include stuff like "don't use @type in your jsdoc"; tsickle
  // warns and then fixes up the code to be Closure-compatible anyway.
  tsickleDiagnostics = tsickleDiagnostics.filter(
      d => d.category === ts.DiagnosticCategory.Error ||
          !host.shouldIgnoreWarningsForPath(d.file.fileName));

  return {
    modulesManifest,
    emitSkipped,
    emittedFiles: emittedFiles || [],
    diagnostics: [...tsDiagnostics, ...tsickleDiagnostics],
    externs
  };
}

function skipTransformForSourceFileIfNeeded(
    host: TransformerHost,
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

function combineInlineSourceMaps(
    program: ts.Program, filePath: string, compiledJsWithInlineSourceMap: string): string {
  if (tsickle.isDtsFileName(filePath)) {
    return compiledJsWithInlineSourceMap;
  }
  const sourceMapJson = extractInlineSourceMap(compiledJsWithInlineSourceMap);
  compiledJsWithInlineSourceMap = removeInlineSourceMap(compiledJsWithInlineSourceMap);
  const composedSourceMap = combineSourceMaps(program, filePath, sourceMapJson);
  return setInlineSourceMap(compiledJsWithInlineSourceMap, composedSourceMap);
}

function combineSourceMaps(
    program: ts.Program, filePath: string, tscSourceMapText: string): string {
  const tscSourceMap = parseSourceMap(tscSourceMapText);
  if (tscSourceMap.sourcesContent) {
    // strip incoming sourcemaps from the sources in the sourcemap
    // to reduce the size of the sourcemap.
    tscSourceMap.sourcesContent = tscSourceMap.sourcesContent.map(content => {
      if (containsInlineSourceMap(content)) {
        content = removeInlineSourceMap(content);
      }
      return content;
    });
  }
  const fileDir = path.dirname(filePath);
  let tscSourceMapGenerator: SourceMapGenerator|undefined;
  for (const sourceFileName of tscSourceMap.sources) {
    const sourceFile = program.getSourceFile(path.resolve(fileDir, sourceFileName));
    if (!sourceFile || !containsInlineSourceMap(sourceFile.text)) {
      continue;
    }
    const preexistingSourceMapText = extractInlineSourceMap(sourceFile.text);
    if (!tscSourceMapGenerator) {
      tscSourceMapGenerator = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(tscSourceMap));
    }
    tscSourceMapGenerator.applySourceMap(
        new SourceMapConsumer(parseSourceMap(preexistingSourceMapText, sourceFileName)));
  }
  return tscSourceMapGenerator ? tscSourceMapGenerator.toString() : tscSourceMapText;
}
