/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// toArray is a temporary function to help in the use of
// ES6 maps and sets when running on node 4, which doesn't
// support Iterators completely.

import * as ts from 'typescript';

export function toArray<T>(iterator: Iterator<T>): T[] {
  const array: T[] = [];
  while (true) {
    const ir = iterator.next();
    if (ir.done) {
      break;
    }
    array.push(ir.value);
  }
  return array;
}

/**
 * Constructs a new ts.CompilerHost that overlays sources in substituteSource
 * over another ts.CompilerHost.
 *
 * @param substituteSource A map of source file name -> overlay source text.
 */
export function createSourceReplacingCompilerHost(
    substituteSource: Map<string, string>, delegate: ts.CompilerHost): ts.CompilerHost {
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
    getDirectories: delegate.getDirectories,
  };

  function getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: (message: string) => void): ts.SourceFile {
    const path: string = ts.sys.resolvePath(fileName);
    const sourceText = substituteSource.get(path);
    if (sourceText !== undefined) {
      return ts.createSourceFile(fileName, sourceText, languageVersion);
    }
    return delegate.getSourceFile(path, languageVersion, onError);
  }
}

/**
 * Returns the input string with line endings normalized to '\n'.
 */
export function normalizeLineEndings(input: string): string {
  return input.replace(/\r\n/g, '\n');
}
