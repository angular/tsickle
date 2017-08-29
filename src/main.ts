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
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as ts from 'typescript';

import * as cliSupport from './cli_support';
import * as tsickle from './tsickle';
import {ModulesManifest} from './tsickle';
import {toArray, createSourceReplacingCompilerHost} from './util';

/** Tsickle settings passed on the command line. */
export interface Settings {
  /** If provided, path to save externs to. */
  externsPath?: string;

  /** If provided, attempt to provide types rather than {?}. */
  isTyped?: boolean;

  /** If true, log internal debug warnings to the console. */
  verbose?: boolean;
}

function usage() {
  console.error(`usage: tsickle [tsickle options] -- [tsc options]

example:
  tsickle --externs=foo/externs.js -- -p src --noImplicitAny

tsickle flags are:
  --externs=PATH     save generated Closure externs.js to PATH
  --typed            [experimental] attempt to provide Closure types instead of {?}
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
    writeFile?: ts.WriteFileCallback): tsickle.EmitResult {
  const compilerHost = ts.createCompilerHost(options);
  const program = ts.createProgram(fileNames, options, compilerHost);
  const transformerHost: tsickle.TsickleHost = {
    shouldSkipTsickleProcessing: (fileName: string) => {
      return fileNames.indexOf(fileName) === -1;
    },
    shouldIgnoreWarningsForPath: (fileName: string) => false,
    pathToModuleName: cliSupport.pathToModuleName,
    fileNameToModuleId: (fileName) => fileName,
    es5Mode: true,
    googmodule: true,
    prelude: '',
    transformDecorators: true,
    transformTypesToClosure: true,
    typeBlackListPaths: new Set(),
    untyped: false,
    logWarning: (warning) => console.error(tsickle.formatDiagnostics([warning])),
  };
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length > 0) {
    return {
      diagnostics,
      modulesManifest: new ModulesManifest(),
      externs: {},
      emitSkipped: true,
      emittedFiles: [],
    };
  }
  return tsickle.emitWithTsickle(
      program, transformerHost, compilerHost, options, undefined, writeFile);
}

function main(args: string[]): number {
  const {settings, tscArgs} = loadSettingsFromArgs(args);
  const config = loadTscConfig(tscArgs);
  if (config.errors.length) {
    console.error(tsickle.formatDiagnostics(config.errors));
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
        mkdirp.sync(path.dirname(filePath));
        fs.writeFileSync(filePath, contents, {encoding: 'utf-8'});
      });
  if (result.diagnostics.length) {
    console.error(tsickle.formatDiagnostics(result.diagnostics));
    return 1;
  }

  if (settings.externsPath) {
    mkdirp.sync(path.dirname(settings.externsPath));
    fs.writeFileSync(settings.externsPath, tsickle.getGeneratedExterns(result.externs));
  }
  return 0;
}

// CLI entry point
if (require.main === module) {
  process.exit(main(process.argv.splice(2)));
}
