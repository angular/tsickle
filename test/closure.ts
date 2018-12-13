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
 * This is the same functionality as the google-closure-compiler npm module,
 * but to make things easy to use in Google's internal environment where
 * the dependencies of that module are unavailable, we don't use any of that
 * module's JavaScript code but only for compiler.jar.
 */

import * as child_process from 'child_process';

/** Options for invoking the compiler. */
export interface Options {
  /**
   * Path to the Closure compiler .jar.
   * Defaults to using the one found in the google-closure-compiler-java npm
   * package.
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
  // tslint:disable-next-line:no-require-imports
  const jarPath = options.jarPath || require('google-closure-compiler-java');

  const javaArgs = ['-jar', jarPath, ...flagsToArgs(flags)];
  const proc = child_process.spawn('java', javaArgs);
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', data => {
      stdout += data;
    });
    proc.stderr.on('data', data => {
      stderr += data;
    });
    proc.on('close', exitCode => {
      resolve({stdout, stderr, exitCode});
    });
    proc.on('error', err => {
      reject(err);
    });
  });
}
