import * as closure from 'google-closure-compiler';
import * as fs from 'fs';
import * as minimist from 'minimist';
import * as path from 'path';
import * as ts from 'typescript';

import * as sickle from './sickle';

/**
 * File name for the generated Closure externs.
 * This is never written to disk, but should be unique with respect to
 * the js files that may actually exist.
 */
const externsFileName = 'sickle_externs.js';

/** Sickle settings passed on the command line. */
interface Settings {
  /** If true, write temporary .js files to disk. Useful for debugging. */
  saveTemporaries?: boolean;

  /** Path to write the final JS bundle to. */
  outputPath: string;
}

function usage() {
  console.error(`usage: sickle [sickle args] -- [tsc args]

example:
  sickle --output bundle.js -- -p src --noImplicitAny

sickle flags are:
  --saveTemporaries  save intermediate .js files to disk
  --output=PATH      write final Closure bundle to PATH
`);
}

/**
 * Parses the command-line arguments, extracting the sickle settings and
 * the arguments to pass on to tsc.
 */
function loadSettingsFromArgs(args: string[]): {settings: Settings, tscArgs: string[]} {
  let settings: Settings = {
    saveTemporaries: null,
    outputPath: null,
  };
  let parsedArgs = minimist(args);
  for (let flag of Object.keys(parsedArgs)) {
    switch (flag) {
      case 'h':
      case 'help':
        usage();
        process.exit(0);
        break;
      case 'saveTemporaries':
        settings.saveTemporaries = true;
        break;
      case 'output':
        settings.outputPath = parsedArgs[flag];
        break;
      case '_':
        // This is part of the minimist API, and holds args after the '--'.
        break;
      default:
        console.error(`unknown flag '--${flag}'`);
        usage();
        process.exit(1);
    }
  }
  if (!settings.outputPath) {
    console.error('must specify --output path');
    usage();
    process.exit(1);
  }
  // Arguments after the '--' arg are arguments to tsc.
  let tscArgs = parsedArgs['_'];
  return {settings, tscArgs};
}

/**
 * Loads the tsconfig.json from a directory.
 * Unfortunately there's a ton of logic in tsc.ts related to searching
 * for tsconfig.json etc. that we don't really want to replicate, e.g.
 * tsc appears to allow -p path/to/tsconfig.json while this only works
 * with -p path/to/containing/dir.
 *
 * @param args tsc command-line arguments.
 */
function loadTscConfig(args: string[]):
    {options?: ts.CompilerOptions, fileNames?: string[], errors?: ts.Diagnostic[]} {
  // Gather tsc options/input files from command line.
  let {options, fileNames, errors} = ts.parseCommandLine(args);
  if (errors.length > 0) {
    return {errors};
  }

  // Read further settings from tsconfig.json.
  let projectDir = options.project || '.';
  let configFileName = path.join(projectDir, 'tsconfig.json');
  let {config: json, error} =
      ts.readConfigFile(configFileName, path => fs.readFileSync(path, 'utf-8'));
  if (error) {
    return {errors: [error]};
  }
  ({options, fileNames, errors} =
       ts.parseJsonConfigFileContent(json, ts.sys, projectDir, options, configFileName));
  if (errors.length > 0) {
    return {errors};
  }

  return {options, fileNames};
}

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
 * Doesn't write any files to disk; all JS content is returned in a map.
 */
function toClosureJS(options: ts.CompilerOptions, fileNames: string[]):
    {jsFiles?: {[fileName: string]: string}, errors?: ts.Diagnostic[]} {
  // Parse and load the program without sickle processing.
  // This is so:
  // - error messages point at the original source text
  // - sickle can use the result of typechecking for annotation
  let program = ts.createProgram(fileNames, options);
  let errors = ts.getPreEmitDiagnostics(program);
  if (errors.length > 0) {
    return {errors};
  }

  // TODO(evanm): let the user configure sickle options via the command line.
  // Or, better, just make sickle always work without needing any options.
  const sickleOptions: sickle.Options = {
    untyped: true,
  };

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

  // Emit, creating a map of fileName => generated JS source.
  let jsFiles: {[fileName: string]: string} = {
    [externsFileName]: sickleExterns,
  };
  function writeFile(fileName: string, data: string): void { jsFiles[fileName] = data; }
  let {diagnostics} = program.emit(undefined, writeFile);
  if (diagnostics.length > 0) {
    return {errors: diagnostics};
  }

  // Postprocess generated JS.
  function pathToModuleName(context: string, fileName: string): string {
    // TODO(evanm): something more sophisticated here?
    return fileName.replace('/', '.');
  }
  for (let fileName of Object.keys(jsFiles)) {
    let {output} =
        sickle.convertCommonJsToGoogModule(fileName, jsFiles[fileName], pathToModuleName);
    jsFiles[fileName] = output;
  }

  return {jsFiles};
}

function closureCompile(
    jsFiles: {[fileName: string]: string}, outFile: string,
    callback: (exitCode: number, output: string) => void): void {
  const closureOptions: closure.CompileOptions = {
    // Read input files from stdin as JSON.
    'json_streams': 'IN',
    // Write output file to disk.
    'js_output_file': outFile,
    'warning_level': 'VERBOSE',
    'language_in': 'ECMASCRIPT6_STRICT',
    'compilation_level': 'ADVANCED_OPTIMIZATIONS',
  };

  let compiler = new closure.compiler(closureOptions);
  let process = compiler.run((exitCode, stdout, stderr) => { callback(exitCode, stderr); });

  let jsonInput: closure.JSONStreamFile[] = [];
  for (let fileName of Object.keys(jsFiles)) {
    jsonInput.push({
      path: fileName,
      src: jsFiles[fileName],
    });
  }
  process.stdin.end(JSON.stringify(jsonInput));
}

function main(args: string[]) {
  let {settings, tscArgs} = loadSettingsFromArgs(args);
  let {options, fileNames, errors} = loadTscConfig(tscArgs);
  if (errors && errors.length > 0) {
    console.error(sickle.formatDiagnostics(errors));
    process.exit(1);
  }

  // Run sickle+TSC to convert inputs to Closure JS files.
  let jsFiles: {[fileName: string]: string};
  ({jsFiles, errors} = toClosureJS(options, fileNames));
  if (errors && errors.length > 0) {
    console.error(sickle.formatDiagnostics(errors));
    process.exit(1);
  }
  if (Object.keys(jsFiles).length === 0) {
    console.error('no js files');
    process.exit(1);
  }

  if (settings.saveTemporaries) {
    for (let fileName of Object.keys(jsFiles)) {
      fs.writeFileSync(fileName, jsFiles[fileName]);
    }
  }

  // Run Closure compiiler to convert JS files to output bundle.
  closureCompile(jsFiles, settings.outputPath, (exitCode, output) => {
    if (output) console.error(output);
    process.exit(exitCode);
  });
}

// CLI entry point
if (require.main === module) {
  main(process.argv.splice(2));
}
