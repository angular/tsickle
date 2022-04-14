/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview Wrapper around shelling out to the Java Closure Compiler.
 *
 * This is the same functionality as the google-closure-compiler npm module, but
 * to make things easy to use in Google's internal environment where the
 * dependencies of that module are unavailable, we wrap that module's JavaScript
 * code and use it only if no compiler.jar is being passed in.
 */

import * as child_process from 'child_process';

/** Options for invoking the compiler. */
export interface Options {
  /**
   * Path to the Closure compiler .jar.
   * If unset, will resolve and use the 'google-closure-compiler' npm package
   * entry point.
   */
  jarPath?: string;
}

/**
 * The type of command-line flags passed to the compiler, as a map of
 * flag name to flag value.  Array-valued flags are translated into the
 * repeated form expected by the compiler.
 */
export interface Flags {
  [flag: string]: boolean|string|string[];
}

/** The type of compilation results, containing exit code and console output. */
export interface Result {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/** Converts a flags object into command-line arguments. */
function flagsToArgs(flags: Flags): string[] {
  const args: string[] = [];
  for (const flag in flags) {
    if (!flags.hasOwnProperty(flag)) continue;
    const value = flags[flag];
    if (typeof value === 'boolean') {
      args.push(`--${flag}`);
    } else if (typeof value === 'string') {
      args.push(`--${flag}=${value}`);
    } else {  // string[]
      for (const val of value) {
        args.push(`--${flag}=${val}`);
      }
    }
  }
  return args;
}

/** Run the compiler, asynchronously returning a Result. */
export function compile(options: Options, flags: Flags): Promise<Result> {
  let compilerProcess: child_process.ChildProcess;
  if (options.jarPath) {
    // If set, directly call into Java using the jar file.
    const javaArgs = ['-jar', options.jarPath, ...flagsToArgs(flags)];
    compilerProcess = child_process.spawn('java', javaArgs);
  } else {
    // Otherwise, use the standard npm entry point. Arguably it'd be nicer to
    // also use a .jar file to be more similar to the case above, but on some
    // platforms, Closure ships a compiled native binary, so there is no jar
    // file this code could locate.
    // tslint:disable-next-line:no-require-imports interacting with untyped .js.
    const closureCompilerCtor = require('google-closure-compiler').compiler;
    compilerProcess = new closureCompilerCtor(flags).run();
  }
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    if (!compilerProcess.stdout) throw new Error('missing stdout');
    if (!compilerProcess.stderr) throw new Error('missing stderr');
    compilerProcess.stdout.on('data', data => {
      stdout += data;
    });
    compilerProcess.stderr.on('data', data => {
      stderr += data;
    });
    compilerProcess.on('close', exitCode => {
      resolve({stdout, stderr, exitCode: exitCode || 0});
    });
    compilerProcess.on('error', err => {
      reject(err);
    });
  });
}
