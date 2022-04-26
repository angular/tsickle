/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * Creates a transformer that captures the state of the AST as pretty printed
 * TypeScript in the provided 'files' map.
 */
export function createAstPrintingTransform(files: Map<string, string>) {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sf: ts.SourceFile): ts.SourceFile => {
      files.set(sf.fileName, ts.createPrinter().printFile(sf));
      return sf;
    };
  };
}
