/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
/**
 * A transformer that ensures the emitted JS file has an \@fileoverview comment
 * that contains an
 * \@suppress {checkTypes} annotation by either adding or updating an existing
 * comment.
 */
export declare function transformFileoverviewCommentFactory(options: ts.CompilerOptions, diagnostics: ts.Diagnostic[], generateExtraSuppressions: boolean): () => (sourceFile: ts.SourceFile) => ts.SourceFile;
