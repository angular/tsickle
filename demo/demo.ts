#!/usr/bin/env node

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as minimist from 'minimist';
import * as path from 'path';
import * as ts from 'typescript';
import * as tsickle from 'tsickle';

/** Tsickle settings passed on the command line. */
export interface Settings {
  /** If provided, path to save externs to. */
  externsPath?: string;

  /** If provided, attempt to provide types rather than {?}. */
  isTyped?: boolean;

  /** If true, log internal debug warnings to the console. */
  verbose?: boolean;

  /** If true, warnings cause a non-zero exit code. */
  fatalWarnings?: boolean;
}

function usage() {
  console.error(`usage: tsickle [tsickle options] -- [tsc options]

example:
  tsickle --externs=foo/externs.js -- -p src --noImplicitAny

tsickle flags are:
  --externs=PATH        save generated Closure externs.js to PATH
  --typed               [experimental] attempt to provide Closure types instead of {?}
  --fatalWarnings       whether warnings should be fatal, and cause tsickle to return a non-zero exit code
`);
}

/**
 * Parses the command-line arguments, extracting the tsickle settings and
 * the arguments to pass on to tsc.
 */
function loadSettingsFromArgs(args: string[]): {settings: Settings, tscArgs: string[]} {
  const settings: Settings = {};
  const parsedArgs = minimist(args);
  for (const flag of Object.keys(parsedArgs)) {
    switch (flag) {
      case 'h':
      case 'help':
        usage();
        process.exit(0);
        break;
      case 'externs':
        settings.externsPath = parsedArgs[flag];
        break;
      case 'typed':
        settings.isTyped = true;
        break;
      case 'verbose':
        settings.verbose = true;
        break;
      case 'fatalWarnings':
        settings.fatalWarnings = true;
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
  // Arguments after the '--' arg are arguments to tsc.
  const tscArgs = parsedArgs['_'];
  return {settings, tscArgs};
}

/**
 * Determine the lowest-level common parent directory of the given list of files.
 */
export function getCommonParentDirectory(fileNames: string[]): string {
  const pathSplitter = /[\/\\]+/;
  const commonParent = fileNames[0].split(pathSplitter);
  for (let i = 1; i < fileNames.length; i++) {
    const thisPath = fileNames[i].split(pathSplitter);
    let j = 0;
    while (thisPath[j] === commonParent[j]) {
      j++;
    }
    commonParent.length = j;  // Truncate without copying the array
  }
  if (commonParent.length === 0) {
    return '/';
  } else {
    return commonParent.join(path.sep);
  }
}

/**
 * Loads the tsconfig.json from a directory.
 *
 * TODO(martinprobst): use ts.findConfigFile to match tsc behaviour.
 *
 * @param args tsc command-line arguments.
 */
function loadTscConfig(args: string[]):
    {options: ts.CompilerOptions, fileNames: string[], errors: ts.Diagnostic[]} {
  // Gather tsc options/input files from command line.
  let {options, fileNames, errors} = ts.parseCommandLine(args);
  if (errors.length > 0) {
    return {options: {}, fileNames: [], errors};
  }

  // Store file arguments
  const tsFileArguments = fileNames;

  // Read further settings from tsconfig.json.
  const projectDir = options.project || '.';
  const configFileName = path.join(projectDir, 'tsconfig.json');
  const {config: json, error} =
      ts.readConfigFile(configFileName, path => fs.readFileSync(path, 'utf-8'));
  if (error) {
    return {options: {}, fileNames: [], errors: [error]};
  }
  ({options, fileNames, errors} =
       ts.parseJsonConfigFileContent(json, ts.sys, projectDir, options, configFileName));
  if (errors.length > 0) {
    return {options: {}, fileNames: [], errors};
  }

  // if file arguments were given to the typescript transpiler then transpile only those files
  fileNames = tsFileArguments.length > 0 ? tsFileArguments : fileNames;

  return {options, fileNames, errors: []};
}

/**
 * Compiles TypeScript code into Closure-compiler-ready JS.
 */
export function toClosureJS(
    options: ts.CompilerOptions, fileNames: string[], settings: Settings,
    writeFile: ts.WriteFileCallback): tsickle.EmitResult {
  // Use absolute paths to determine what files to process since files may be imported using
  // relative or absolute paths
  const absoluteFileNames = fileNames.map(i => path.resolve(i));

  const compilerHost = ts.createCompilerHost(options);
  const program = ts.createProgram(absoluteFileNames, options, compilerHost);
  const filesToProcess = new Set(absoluteFileNames);
  const rootModulePath = options.rootDir || getCommonParentDirectory(absoluteFileNames);
  const transformerHost: tsickle.TsickleHost = {
    rootDirsRelative: (f: string) => f,
    shouldSkipTsickleProcessing: (fileName: string) => {
      return !filesToProcess.has(path.resolve(fileName));
    },
    shouldIgnoreWarningsForPath: (fileName: string) => !settings.fatalWarnings,
    pathToModuleName: (context, fileName) =>
        tsickle.pathToModuleName(rootModulePath, context, fileName),
    fileNameToModuleId: (fileName) => path.relative(rootModulePath, fileName),
    googmodule: true,
    transformDecorators: true,
    transformTypesToClosure: true,
    typeBlackListPaths: new Set(),
    untyped: false,
    logWarning: (warning) =>
        console.error(ts.formatDiagnostics([warning], compilerHost)),
    options,
    generateExtraSuppressions: true,
    transformDynamicImport: 'nodejs',
  };
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length > 0) {
    return {
      tsMigrationExportsShimFiles: new Map(),
      diagnostics,
      modulesManifest: new tsickle.ModulesManifest(),
      externs: {},
      emitSkipped: true,
      emittedFiles: [],
      fileSummaries: new Map(),
    };
  }
  return tsickle.emit(program, transformerHost, writeFile);
}

function main(args: string[]): number {
  const {settings, tscArgs} = loadSettingsFromArgs(args);
  const config = loadTscConfig(tscArgs);
  if (config.errors.length) {
    console.error(ts.formatDiagnostics(config.errors, ts.createCompilerHost(config.options)));
    return 1;
  }

  if (config.options.module !== ts.ModuleKind.CommonJS) {
    // This is not an upstream TypeScript diagnostic, therefore it does not go
    // through the diagnostics array mechanism.
    console.error(
        'tsickle converts TypeScript modules to Closure modules via CommonJS internally. ' +
        'Set tsconfig.js "module": "commonjs"');
    return 1;
  }

  // Run tsickle+TSC to convert inputs to Closure JS files.
  const result = toClosureJS(
      config.options, config.fileNames, settings, (filePath: string, contents: string) => {
        fs.mkdirSync(path.dirname(filePath), {recursive: true});
        fs.writeFileSync(filePath, contents, {encoding: 'utf-8'});
      });
  if (result.diagnostics.length) {
    console.error(ts.formatDiagnostics(result.diagnostics, ts.createCompilerHost(config.options)));
    return 1;
  }

  if (settings.externsPath) {
    fs.mkdirSync(path.dirname(settings.externsPath), {recursive: true});
    fs.writeFileSync(
        settings.externsPath,
        tsickle.getGeneratedExterns(result.externs, config.options.rootDir || ''));
  }
  return 0;
}

// CLI entry point
if (require.main === module) {
  process.exit(main(process.argv.splice(2)));
}
