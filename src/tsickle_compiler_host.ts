import * as ts from 'typescript';

import {convertDecorators} from './decorator-annotator';
import {processES5} from './es5processor';
import {ModulesManifest} from './modules_manifest';
import {annotate} from './tsickle';

export enum Pass {
  None,
  DecoratorDownlevel,
  Tsickle
}

export interface TsickleCompilerHostOptions {
  googmodule: boolean;
  es5Mode: boolean;
  tsickleTyped: boolean;
  prelude: string;
}

export interface TsickleEnvironment {
  /**
   * If true, tsickle and decorator downlevel processing will be skipped for
   * that file.
   */
  shouldSkipTsickleProcessing: (fileName: string) => boolean;
  /**
   * Takes a context (the current file) and the path of the file to import
   *  and generates a googmodule module name
   */
  pathToModuleName: (context: string, importPath: string) => string;
  /**
   * Tsickle treats warnings as errors, if true, ignore warnings.  This might be
   * useful for e.g. third party code.
   */
  shouldIgnoreWarningsForPath: (filePath: string) => boolean;
  /**
   * If we do googmodule processing, we polyfill module.id, since that's
   * part of ES6 modules.  This function determines what the module.id will be
   * for each file.
   */
  fileNameToModuleId: (fileName: string) => string;
}

/**
 * TsickleCompilerHost does tsickle processing of input files, including
 * closure type annotation processing, decorator downleveling and
 * require -> googmodule rewriting.
 */
export class TsickleCompilerHost implements ts.CompilerHost {
  private ANNOTATION_SUPPORT = `
interface DecoratorInvocation {
  type: Function;
  args?: any[];
}
`;
  // The manifest of JS modules output by the compiler.
  public modulesManifest: ModulesManifest = new ModulesManifest();

  /** Error messages produced by tsickle, if any. */
  public diagnostics: ts.Diagnostic[] = [];

  /** externs.js files produced by tsickle, if any. */
  public externs: {[fileName: string]: string} = {};

  constructor(
      private delegate: ts.CompilerHost, private options: TsickleCompilerHostOptions,
      private environment: TsickleEnvironment, private oldProgram?: ts.Program,
      private pass = Pass.None) {}


  public reconfigureForRun(program: ts.Program, pass: Pass) {
    this.oldProgram = program;
    this.pass = pass;
  }

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: (message: string) => void): ts.SourceFile {
    if (this.pass === Pass.None) {
      return this.delegate.getSourceFile(fileName, languageVersion, onError);
    }

    if (!this.oldProgram) {
      throw new Error('tried to run a pass other than None without setting a program');
    }

    const sourceFile = this.oldProgram.getSourceFile(fileName);
    switch (this.pass) {
      case Pass.DecoratorDownlevel:
        return this.runDecoratorDownlevel(sourceFile, this.oldProgram, fileName, languageVersion);
      case Pass.Tsickle:
        return this.runTsickle(sourceFile, this.oldProgram, fileName, languageVersion);
      default:
        throw new Error('tried to use TsickleCompilerHost with unknown pass enum');
    }
  }

  writeFile(
      fileName: string, content: string, writeByteOrderMark: boolean,
      onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]): void {
    fileName = this.delegate.getCanonicalFileName(fileName);
    if (this.options.googmodule && !fileName.match(/\.d\.ts$/)) {
      content = this.convertCommonJsToGoogModule(fileName, content);
    }

    this.delegate.writeFile(fileName, content, writeByteOrderMark, onError, sourceFiles);
  }

  convertCommonJsToGoogModule(fileName: string, content: string): string {
    const moduleId = this.environment.fileNameToModuleId(fileName);

    let {output, referencedModules} = processES5(
        fileName, moduleId, content, this.environment.pathToModuleName.bind(this.environment),
        this.options.es5Mode, this.options.prelude);

    const moduleName = this.environment.pathToModuleName('', fileName);
    this.modulesManifest.addModule(fileName, moduleName);
    for (let referenced of referencedModules) {
      this.modulesManifest.addReferencedModule(fileName, referenced);
    }

    return output;
  }

  private runDecoratorDownlevel(
      sourceFile: ts.SourceFile, program: ts.Program, fileName: string,
      languageVersion: ts.ScriptTarget): ts.SourceFile {
    if (this.environment.shouldSkipTsickleProcessing(fileName)) return sourceFile;
    let fileContent = sourceFile.text;
    const converted = convertDecorators(program.getTypeChecker(), sourceFile);
    if (converted.diagnostics) {
      this.diagnostics.push(...converted.diagnostics);
    }
    if (converted.output === fileContent) {
      // No changes; reuse the existing parse.
      return sourceFile;
    }
    fileContent = converted.output + this.ANNOTATION_SUPPORT;
    return ts.createSourceFile(fileName, fileContent, languageVersion, true);
  }

  private runTsickle(
      sourceFile: ts.SourceFile, program: ts.Program, fileName: string,
      languageVersion: ts.ScriptTarget): ts.SourceFile {
    let isDefinitions = /\.d\.ts$/.test(fileName);
    // Don't tsickle-process any d.ts that isn't a compilation target;
    // this means we don't process e.g. lib.d.ts.
    if (isDefinitions && this.environment.shouldSkipTsickleProcessing(fileName)) return sourceFile;

    let {output, externs, diagnostics} =
        annotate(program, sourceFile, {untyped: !this.options.tsickleTyped});
    if (externs) {
      this.externs[fileName] = externs;
    }
    if (this.environment.shouldIgnoreWarningsForPath(sourceFile.path)) {
      // All diagnostics (including warnings) are treated as errors.
      // If we've decided to ignore them, just discard them.
      // Warnings include stuff like "don't use @type in your jsdoc"; tsickle
      // warns and then fixes up the code to be Closure-compatible anyway.
      diagnostics = diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);
    }
    this.diagnostics = diagnostics;
    return ts.createSourceFile(fileName, output, languageVersion, true);
  }

  /** Concatenate all generated externs definitions together into a string. */
  getGeneratedExterns(): string {
    let allExterns = '';
    for (let fileName of Object.keys(this.externs)) {
      allExterns += `// externs from ${fileName}:\n`;
      allExterns += this.externs[fileName];
    }
    return allExterns;
  }

  // Delegate everything else to the original compiler host.

  fileExists(fileName: string): boolean {
    return this.delegate.fileExists(fileName);
  }

  getCurrentDirectory(): string {
    return this.delegate.getCurrentDirectory();
  };

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
}
