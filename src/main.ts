import * as ts from 'typescript';

import * as sickle from './sickle';

/**
 * Constructs a new ts.CompilerHost that overlays sources in substituteSource
 * over another ts.CompilerHost.
 *
 * @param substituteSource A map of source file name -> overlay source text.
 */
function createSourceReplacingCompilerHost(
    substituteSource: ts.Map<string>, delegate: ts.CompilerHost): ts.CompilerHost {
  return {
    getSourceFile,
    getCancellationToken: delegate.getCancellationToken,
    getDefaultLibFileName: delegate.getDefaultLibFileName,
    writeFile: delegate.writeFile,
    getCurrentDirectory: delegate.getCurrentDirectory,
    getCanonicalFileName: delegate.getCanonicalFileName,
    useCaseSensitiveFileNames: delegate.useCaseSensitiveFileNames,
    getNewLine: delegate.getNewLine,
    fileExists: delegate.fileExists,
    readFile: delegate.readFile,
    directoryExists: delegate.directoryExists,
  };

  function getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: (message: string) => void): ts.SourceFile {
    let sourceText: string;
    if (substituteSource.hasOwnProperty(fileName)) {
      sourceText = substituteSource[fileName];
      return ts.createSourceFile(fileName, sourceText, languageVersion);
    }
    return delegate.getSourceFile(fileName, languageVersion, onError);
  }
}

/**
 * Compiles TypeScript code into Closure-compiler-ready JS.
 *
 * @param args TypeScript compiler command-line arguments.
 */
function toClosureJS(args: string[]): {jsFiles?: string[], errors: ts.Diagnostic[]} {
  // TODO(evanm): let the user configure sickle options, perhaps by
  // passing them through tsconfig.json?  Or, better, just make sickle
  // always work without needing any options.
  const sickleOptions: sickle.Options = {
    untyped: true,
  };
  let {options, fileNames, errors} = ts.parseCommandLine(args);
  if (errors.length > 0) {
    return {errors};
  }

  // Parse and load the program without sickle processing.
  // This is so:
  // - error messages point at the original source text
  // - sickle can use the result of typechecking for annotation
  let program = ts.createProgram(fileNames, options);
  errors = ts.getPreEmitDiagnostics(program);
  if (errors.length > 0) {
    return {errors};
  }

  // Process each input file with sickle and save the output.
  let sickleOutput: ts.Map<string> = {};
  let sickleExterns = '';
  for (let fileName of fileNames) {
    let {output, externs, diagnostics} =
        sickle.annotate(program, program.getSourceFile(fileName), sickleOptions);
    if (diagnostics.length > 0) {
      return {errors: diagnostics};
    }
    sickleOutput[fileName] = output;
    if (externs) {
      sickleExterns += externs;
    }
  }

  // Reparse and reload the program, inserting the sickle output in
  // place of the original source.
  let host = createSourceReplacingCompilerHost(sickleOutput, ts.createCompilerHost(options));
  program = ts.createProgram(fileNames, options, host);
  errors = ts.getPreEmitDiagnostics(program);
  if (errors.length > 0) {
    return {errors};
  }

  let jsFiles: string[] = [];

  function writeFile(
      fileName: string, data: string, writeByteOrderMark: boolean,
      onError?: (message: string) => void): void {
    host.writeFile(fileName, data, writeByteOrderMark, onError);
    jsFiles.push(fileName);
  }

  let {emitSkipped, diagnostics} = program.emit(undefined, writeFile);
  if (diagnostics.length > 0) {
    return {errors: diagnostics};
  }

  return {jsFiles, errors: []};
}

// CLI entry point
if (require.main === module) {
  let {jsFiles, errors} = toClosureJS(process.argv.splice(2));
  if (errors.length > 0) {
    console.log(sickle.formatDiagnostics(errors));
    process.exit(1);
  }
  console.log('wrote', jsFiles);
}
