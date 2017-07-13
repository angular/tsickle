/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import {SourceMapGenerator} from 'source-map';
import * as ts from 'typescript';

import {convertDecorators} from './decorator-annotator';
import {convertCommonJsToGoogModuleIfNeeded, Es5ProcessorHost, Es5ProcessorOptions} from './es5processor';
import {ModulesManifest} from './modules_manifest';
import * as sourceMapUtils from './source_map_utils';
import * as tsickle from './tsickle';
import {isDtsFileName} from './tsickle';

/**
 * Tsickle can perform 2 different precompilation transforms - decorator downleveling
 * and closurization.  Both require tsc to have already type checked their
 * input, so they can't both be run in one call to tsc. If you only want one of
 * the transforms, you can specify it in the constructor, if you want both, you'll
 * have to specify it by calling reconfigureForRun() with the appropriate Pass.
 */
export enum Pass {
  NONE,
  /**
   * Note that we can do decorator downlevel and closurize in one pass,
   * so this should not be used anymore.
   */
  DECORATOR_DOWNLEVEL,
  /**
   * Note that we can do decorator downlevel and closurize in one pass,
   * so this should not be used anymore.
   */
  CLOSURIZE,
  DECORATOR_DOWNLEVEL_AND_CLOSURIZE,
}

export interface Options extends Es5ProcessorOptions, tsickle.AnnotatorOptions {
  // This method is here for backwards compatibility.
  // Use the method in TsickleHost instead.
  logWarning?: TsickleHost['logWarning'];
}

/**
 *  Provides hooks to customize TsickleCompilerHost's behavior for different
 *  compilation environments.
 */
export interface TsickleHost extends Es5ProcessorHost, tsickle.AnnotatorHost {
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

/**
 * TsickleCompilerHost does tsickle processing of input files, including
 * closure type annotation processing, decorator downleveling and
 * require -> googmodule rewriting.
 */
export class TsickleCompilerHost implements ts.CompilerHost {
  // The manifest of JS modules output by the compiler.
  public modulesManifest = new ModulesManifest();

  /** Error messages produced by tsickle, if any. */
  public diagnostics: ts.Diagnostic[] = [];

  /** externs.js files produced by tsickle, if any. */
  public externs: {[fileName: string]: string} = {};

  private sourceFileToPreexistingSourceMap = new Map<ts.SourceFile, SourceMapGenerator>();
  private preexistingSourceMaps = new Map<string, SourceMapGenerator>();
  private decoratorDownlevelSourceMaps = new Map<string, SourceMapGenerator>();
  private tsickleSourceMaps = new Map<string, SourceMapGenerator>();

  private runConfiguration: {oldProgram: ts.Program, pass: Pass}|undefined;

  constructor(
      private delegate: ts.CompilerHost, private tscOptions: ts.CompilerOptions,
      private options: Options, private environment: TsickleHost) {
    if (options.logWarning && !environment.logWarning) {
      environment.logWarning = options.logWarning;
    }
    // ts.CompilerHost includes a bunch of optional methods.  If they're
    // present on the delegate host, we want to delegate them.
    if (this.delegate.getCancellationToken) {
      this.getCancellationToken = this.delegate.getCancellationToken!.bind(this.delegate);
    }
    if (this.delegate.getDefaultLibLocation) {
      this.getDefaultLibLocation = this.delegate.getDefaultLibLocation!.bind(this.delegate);
    }
    if (this.delegate.resolveModuleNames) {
      this.resolveModuleNames = this.delegate.resolveModuleNames!.bind(this.delegate);
    }
    if (this.delegate.resolveTypeReferenceDirectives) {
      this.resolveTypeReferenceDirectives =
          this.delegate.resolveTypeReferenceDirectives!.bind(this.delegate);
    }
    if (this.delegate.getEnvironmentVariable) {
      this.getEnvironmentVariable = this.delegate.getEnvironmentVariable!.bind(this.delegate);
    }
    if (this.delegate.trace) {
      this.trace = this.delegate.trace!.bind(this.delegate);
    }
    if (this.delegate.directoryExists) {
      this.directoryExists = this.delegate.directoryExists!.bind(this.delegate);
    }
    if (this.delegate.realpath) {
      this.delegate.realpath = this.delegate.realpath!.bind(this.delegate);
    }
  }

  /**
   * Tsickle can perform 2 kinds of precompilation source transforms - decorator
   * downleveling and closurization.  They can't be run in the same run of the
   * typescript compiler, because they both depend on type information that comes
   * from running the compiler.  We need to use the same compiler host to run both
   * so we have all the source map data when finally write out.  Thus if we want
   * to run both transforms, we call reconfigureForRun() between the calls to
   * ts.createProgram().
   */
  public reconfigureForRun(oldProgram: ts.Program, pass: Pass) {
    this.runConfiguration = {oldProgram, pass};
    this.diagnostics = [];
  }

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: (message: string) => void): ts.SourceFile {
    if (this.runConfiguration === undefined || this.runConfiguration.pass === Pass.NONE) {
      const sourceFile = this.delegate.getSourceFile(fileName, languageVersion, onError);
      return this.stripAndStoreExistingSourceMap(sourceFile);
    }

    const sourceFile = this.runConfiguration.oldProgram.getSourceFile(fileName);
    switch (this.runConfiguration.pass) {
      case Pass.DECORATOR_DOWNLEVEL:
        return this.downlevelDecorators(
            sourceFile, this.runConfiguration.oldProgram, fileName, languageVersion);
      case Pass.CLOSURIZE:
        return this.closurize(
            sourceFile, this.runConfiguration.oldProgram, fileName, languageVersion,
            /* downlevelDecorators */ false);
      case Pass.DECORATOR_DOWNLEVEL_AND_CLOSURIZE:
        return this.closurize(
            sourceFile, this.runConfiguration.oldProgram, fileName, languageVersion,
            /* downlevelDecorators */ true);
      default:
        throw new Error('tried to use TsickleCompilerHost with unknown pass enum');
    }
  }

  writeFile(
      fileName: string, content: string, writeByteOrderMark: boolean,
      onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]): void {
    if (path.extname(fileName) !== '.map') {
      if (!isDtsFileName(fileName) && this.tscOptions.inlineSourceMap) {
        content = this.combineInlineSourceMaps(fileName, content);
      }
      content = this.convertCommonJsToGoogModule(fileName, content);
    } else {
      content = this.combineSourceMaps(fileName, content);
    }

    this.delegate.writeFile(fileName, content, writeByteOrderMark, onError, sourceFiles);
  }

  getSourceMapKeyForPathAndName(outputFilePath: string, sourceFileName: string): string {
    const fileDir = path.dirname(outputFilePath);

    return this.getCanonicalFileName(path.resolve(fileDir, sourceFileName));
  }

  getSourceMapKeyForSourceFile(sourceFile: ts.SourceFile): string {
    return this.getCanonicalFileName(path.resolve(sourceFile.fileName));
  }

  stripAndStoreExistingSourceMap(sourceFile: ts.SourceFile): ts.SourceFile {
    // Because tsc doesn't have strict null checks, it can pass us an
    // undefined sourceFile, but we can't acknowledge that it does, because
    // we have to comply with their interface, which doesn't allow
    // undefined as far as we're concerned
    if (sourceFile && sourceMapUtils.containsInlineSourceMap(sourceFile.text)) {
      const sourceMapJson = sourceMapUtils.extractInlineSourceMap(sourceFile.text);
      const sourceMap = sourceMapUtils.sourceMapTextToGenerator(sourceMapJson);

      const stripedSourceText = sourceMapUtils.removeInlineSourceMap(sourceFile.text);
      const stripedSourceFile =
          ts.createSourceFile(sourceFile.fileName, stripedSourceText, sourceFile.languageVersion);
      this.sourceFileToPreexistingSourceMap.set(stripedSourceFile, sourceMap);
      return stripedSourceFile;
    }

    return sourceFile;
  }

  combineSourceMaps(filePath: string, tscSourceMapText: string): string {
    const printDebugInfo = false;
    // const printDebugInfo = true;
    // We stripe inline source maps off source files before they've been parsed
    // which is before they have path properties, so we need to construct the
    // map of sourceMapKey to preexistingSourceMap after the whole program has been
    // loaded.
    if (this.sourceFileToPreexistingSourceMap.size > 0 && this.preexistingSourceMaps.size === 0) {
      this.sourceFileToPreexistingSourceMap.forEach((sourceMap, sourceFile) => {
        const sourceMapKey = this.getSourceMapKeyForSourceFile(sourceFile);
        this.preexistingSourceMaps.set(sourceMapKey, sourceMap);
      });
    }

    const tscSourceMapConsumer = sourceMapUtils.sourceMapTextToConsumer(tscSourceMapText);
    const tscSourceMapGenerator = sourceMapUtils.sourceMapConsumerToGenerator(tscSourceMapConsumer);

    if (printDebugInfo) {
      console.error(`tsc source map for ${filePath}`);
      console.error(tscSourceMapGenerator.toString());
    }

    if (this.tsickleSourceMaps.size > 0) {
      // TODO(lucassloan): remove when the .d.ts has the correct types
      // tslint:disable-next-line:no-any
      for (const sourceFileName of (tscSourceMapConsumer as any).sources) {
        const sourceMapKey = this.getSourceMapKeyForPathAndName(filePath, sourceFileName);
        const tsickleSourceMapGenerator = this.tsickleSourceMaps.get(sourceMapKey)!;
        const tsickleSourceMapConsumer = sourceMapUtils.sourceMapGeneratorToConsumer(
            tsickleSourceMapGenerator, sourceFileName, sourceFileName);
        tscSourceMapGenerator.applySourceMap(tsickleSourceMapConsumer);
        if (printDebugInfo) {
          console.error(`tsickle source map for ${filePath}`);
          console.error(tsickleSourceMapGenerator.toString());
        }
      }
    }
    if (this.decoratorDownlevelSourceMaps.size > 0) {
      // TODO(lucassloan): remove when the .d.ts has the correct types
      // tslint:disable-next-line:no-any
      for (const sourceFileName of (tscSourceMapConsumer as any).sources) {
        const sourceMapKey = this.getSourceMapKeyForPathAndName(filePath, sourceFileName);
        const decoratorDownlevelSourceMapGenerator =
            this.decoratorDownlevelSourceMaps.get(sourceMapKey)!;
        const decoratorDownlevelSourceMapConsumer = sourceMapUtils.sourceMapGeneratorToConsumer(
            decoratorDownlevelSourceMapGenerator, sourceFileName, sourceFileName);
        tscSourceMapGenerator.applySourceMap(decoratorDownlevelSourceMapConsumer);
        if (printDebugInfo) {
          console.error(`decorator downlevel sourcemap for ${filePath}`);
          console.error(decoratorDownlevelSourceMapGenerator.toString());
        }
      }
    }
    if (this.preexistingSourceMaps.size > 0) {
      // TODO(lucassloan): remove when the .d.ts has the correct types
      // tslint:disable-next-line:no-any
      for (const sourceFileName of (tscSourceMapConsumer as any).sources) {
        const sourceMapKey = this.getSourceMapKeyForPathAndName(filePath, sourceFileName);
        const preexistingSourceMapGenerator = this.preexistingSourceMaps.get(sourceMapKey);
        if (preexistingSourceMapGenerator) {
          const preexistingSourceMapConsumer = sourceMapUtils.sourceMapGeneratorToConsumer(
              preexistingSourceMapGenerator, sourceFileName);
          tscSourceMapGenerator.applySourceMap(preexistingSourceMapConsumer);
          if (printDebugInfo) {
            console.error(`preexisting source map for ${filePath}`);
            console.error(preexistingSourceMapGenerator.toString());
          }
        }
      }
    }


    return tscSourceMapGenerator.toString();
  }

  combineInlineSourceMaps(filePath: string, compiledJsWithInlineSourceMap: string): string {
    const sourceMapJson = sourceMapUtils.extractInlineSourceMap(compiledJsWithInlineSourceMap);
    const composedSourceMap = this.combineSourceMaps(filePath, sourceMapJson);
    return sourceMapUtils.setInlineSourceMap(compiledJsWithInlineSourceMap, composedSourceMap);
  }

  convertCommonJsToGoogModule(fileName: string, content: string): string {
    return convertCommonJsToGoogModuleIfNeeded(
        this.environment, this.options, this.modulesManifest, fileName, content);
  }

  private downlevelDecorators(
      sourceFile: ts.SourceFile, program: ts.Program, fileName: string,
      languageVersion: ts.ScriptTarget): ts.SourceFile {
    this.decoratorDownlevelSourceMaps.set(
        this.getSourceMapKeyForSourceFile(sourceFile), new SourceMapGenerator());
    if (this.environment.shouldSkipTsickleProcessing(fileName)) return sourceFile;
    let fileContent = sourceFile.text;
    const sourceMapper = new sourceMapUtils.DefaultSourceMapper(sourceFile.fileName);
    const converted = convertDecorators(program.getTypeChecker(), sourceFile, sourceMapper);
    if (converted.diagnostics) {
      this.diagnostics.push(...converted.diagnostics);
    }
    if (converted.output === fileContent) {
      // No changes; reuse the existing parse.
      return sourceFile;
    }
    fileContent = converted.output;
    this.decoratorDownlevelSourceMaps.set(
        this.getSourceMapKeyForSourceFile(sourceFile), sourceMapper.sourceMap);
    return ts.createSourceFile(fileName, fileContent, languageVersion, true);
  }

  private closurize(
      sourceFile: ts.SourceFile, program: ts.Program, fileName: string,
      languageVersion: ts.ScriptTarget, downlevelDecorators: boolean): ts.SourceFile {
    this.tsickleSourceMaps.set(
        this.getSourceMapKeyForSourceFile(sourceFile), new SourceMapGenerator());
    const isDefinitions = isDtsFileName(fileName);
    // Don't tsickle-process any d.ts that isn't a compilation target;
    // this means we don't process e.g. lib.d.ts.
    if (isDefinitions && this.environment.shouldSkipTsickleProcessing(fileName)) return sourceFile;

    const sourceMapper = new sourceMapUtils.DefaultSourceMapper(sourceFile.fileName);
    const annotated = tsickle.annotate(
        program.getTypeChecker(), sourceFile, this.environment, this.options, this.delegate,
        this.tscOptions, sourceMapper,
        downlevelDecorators ? tsickle.AnnotatorFeatures.LowerDecorators :
                              tsickle.AnnotatorFeatures.Default);
    const externs =
        tsickle.writeExterns(program.getTypeChecker(), sourceFile, this.environment, this.options);
    let diagnostics = externs.diagnostics.concat(annotated.diagnostics);
    if (externs) {
      this.externs[fileName] = externs.output;
    }
    if (this.environment.shouldIgnoreWarningsForPath(sourceFile.fileName)) {
      // All diagnostics (including warnings) are treated as errors.
      // If we've decided to ignore them, just discard them.
      // Warnings include stuff like "don't use @type in your jsdoc"; tsickle
      // warns and then fixes up the code to be Closure-compatible anyway.
      diagnostics = diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);
    }
    this.diagnostics.push(...diagnostics);
    this.tsickleSourceMaps.set(
        this.getSourceMapKeyForSourceFile(sourceFile), sourceMapper.sourceMap);
    return ts.createSourceFile(fileName, annotated.output, languageVersion, true);
  }

  /** Concatenate all generated externs definitions together into a string. */
  getGeneratedExterns(): string {
    return tsickle.getGeneratedExterns(this.externs);
  }

  // Delegate everything else to the original compiler host.
  fileExists(fileName: string): boolean {
    return this.delegate.fileExists(fileName);
  }

  getCurrentDirectory(): string {
    return this.delegate.getCurrentDirectory();
  }

  useCaseSensitiveFileNames(): boolean {
    return this.delegate.useCaseSensitiveFileNames();
  }

  getNewLine(): string {
    return this.delegate.getNewLine();
  }

  getDirectories(path: string) {
    return this.delegate.getDirectories(path);
  }

  readFile(fileName: string): string {
    return this.delegate.readFile(fileName);
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return this.delegate.getDefaultLibFileName(options);
  }

  getCanonicalFileName(fileName: string): string {
    return this.delegate.getCanonicalFileName(fileName);
  }

  // Optional delegated methods, see constructor
  public getCancellationToken: (() => ts.CancellationToken)|undefined;
  public getDefaultLibLocation: (() => string)|undefined;
  public resolveModuleNames:
      ((moduleNames: string[], containingFile: string) => ts.ResolvedModule[])|undefined;
  public resolveTypeReferenceDirectives:
      ((typeReferenceDirectiveNames: string[],
        containingFile: string) => ts.ResolvedTypeReferenceDirective[])|undefined;
  public getEnvironmentVariable: ((name: string) => string)|undefined;
  public trace: ((s: string) => void)|undefined;
  public directoryExists: ((directoryName: string) => boolean)|undefined;
  public realpath: ((path: string) => string)|undefined;
}
