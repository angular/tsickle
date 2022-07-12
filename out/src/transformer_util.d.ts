/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
/** @return true if node has the specified modifier flag set. */
export declare function hasModifierFlag(declaration: ts.Declaration, flag: ts.ModifierFlags): boolean;
/**
 * @return true if node or one of its ancestors has the Ambient modifier flag
 *     set.
 */
export declare function isAmbient(node: ts.Node): boolean;
/** Returns true if fileName is a .d.ts file. */
export declare function isDtsFileName(fileName: string): boolean;
/** Returns the string contents of a ts.Identifier. */
export declare function getIdentifierText(identifier: ts.Identifier): string;
/**
 * Returns true if the given symbol refers to a value (as distinct from a type).
 *
 * Expands aliases, which is important for the case where
 *   import * as x from 'some-module';
 * and x is now a value (the module object).
 */
export declare function symbolIsValue(tc: ts.TypeChecker, sym: ts.Symbol): boolean;
/** Returns a dot-joined qualified name (foo.bar.Baz). */
export declare function getEntityNameText(name: ts.EntityName): string;
/**
 * Converts an escaped TypeScript name into the original source name.
 */
export declare function unescapeName(name: ts.__String): string;
/**
 * ts.createNotEmittedStatement will create a node, but the comments covered by its text range are
 * never emittedm except for very specific special cases (/// comments).
 *
 * createNotEmittedStatementWithComments creates a not emitted statement and adds comment ranges
 * from the original statement as synthetic comments to it, so that they get retained in the output.
 */
export declare function createNotEmittedStatementWithComments(sourceFile: ts.SourceFile, original: ts.Node): ts.Statement;
/**
 * Converts `ts.CommentRange`s into `ts.SynthesizedComment`s.
 */
export declare function synthesizeCommentRanges(sourceFile: ts.SourceFile, parsedComments: ts.CommentRange[]): ts.SynthesizedComment[];
/**
 * Creates a non emitted statement that can be used to store synthesized comments.
 */
export declare function createNotEmittedStatement(sourceFile: ts.SourceFile): ts.NotEmittedStatement;
/**
 * This is a version of `ts.visitEachChild` that works that calls our version
 * of `updateSourceFileNode`, so that typescript doesn't lose type information
 * for property decorators.
 * See https://github.com/Microsoft/TypeScript/issues/17384
 */
export declare function visitEachChild(node: ts.Node, visitor: ts.Visitor, context: ts.TransformationContext): ts.Node;
/**
 * This is a version of `ts.updateSourceFileNode` that works
 * well with property decorators.
 * See https://github.com/Microsoft/TypeScript/issues/17384
 * TODO(#634): This has been fixed in TS 2.5. Investigate removal.
 */
export declare function updateSourceFileNode(sf: ts.SourceFile, statements: ts.NodeArray<ts.Statement>): ts.SourceFile;
/**
 * Creates a string literal that uses single quotes. Purely cosmetic, but increases fidelity to the
 * existing test suite.
 */
export declare function createSingleQuoteStringLiteral(text: string): ts.StringLiteral;
/** Creates a not emitted statement with the given text as a single line comment. */
export declare function createSingleLineComment(original: ts.Node, text: string): ts.NotEmittedStatement;
/** Creates a not emitted statement with the given text as a single line comment. */
export declare function createMultiLineComment(original: ts.Node, text: string): ts.NotEmittedStatement;
/**
 * debugWarn logs a debug warning.
 *
 * These should only be used for cases where tsickle is making a questionable judgement about what
 * to do. By default, tsickle does not report any warnings to the caller, and warnings are hidden
 * behind a debug flag, as warnings are only for tsickle to debug itself.
 */
export declare function reportDebugWarning(host: {
    logWarning?(d: ts.Diagnostic): void;
}, node: ts.Node, messageText: string): void;
/**
 * Creates and reports a diagnostic by adding it to the given array.
 *
 * This is used for errors and warnings in tsickle's input. Emit errors (the default) if tsickle
 * cannot emit a correct result given the input. Emit warnings for questionable input if there's a
 * good chance that the output will work.
 *
 * For typical tsickle users, errors are always reported and break the compilation operation,
 * warnings will only be emitted for first party code (and break the compilation there), but wil be
 * ignored for third party code.
 *
 * @param textRange pass to overrride the text range from the node with a more specific range.
 */
export declare function reportDiagnostic(diagnostics: ts.Diagnostic[], node: ts.Node, messageText: string, textRange?: ts.TextRange, category?: ts.DiagnosticCategory): void;
/**
 * A replacement for ts.getLeadingCommentRanges that returns the union of synthetic and
 * non-synthetic comments on the given node, with their text included. The returned comments must
 * not be mutated, as their content might or might not be reflected back into the AST.
 */
export declare function getAllLeadingComments(node: ts.Node): ReadonlyArray<Readonly<ts.CommentRange & {
    text: string;
}>>;
/**
 * Creates a call expression corresponding to `goog.${methodName}(${literal})`.
 */
export declare function createGoogCall(methodName: string, literal: ts.StringLiteral): ts.CallExpression;
/**
 * Returns the function name called in the given call expression (vis. returns
 * `$fnName` when pased `goog.$fnName`), or null if the given call expression is
 * not of the form `goog.$fnName`.
 */
export declare function getGoogFunctionName(call: ts.CallExpression): string | null;
/**
 * Returns true if the given call executes `goog.$fnName`. Does
 * not check whether `goog` is the expected symbol (vs e.g. a local variable).
 */
export declare function isGoogCallExpressionOf(n: ts.Node, fnName: string): n is ts.CallExpression;
/**
 * Returns true if the given call executes `goog.tsMigrationExportsShim`,
 * `goog.tsMigrationNamedExportsShim`, or `goog.tsMigrationDefaultExportsShim`.
 * Does not check whether `goog` is the expected symbol (vs e.g. a local
 * variable).
 */
export declare function isAnyTsmesCall(n: ts.Node): n is ts.CallExpression;
/**
 * Returns true if the given call executes `goog.tsMigrationNamedExportsShim`,
 * or `goog.tsMigrationDefaultExportsShim`, ie one of the tsmes methods that
 * only take one argument. Does not check whether `goog` is the expected symbol
 * (vs e.g. a local variable).
 */
export declare function isTsmesShorthandCall(n: ts.Node): n is ts.CallExpression;
/**
 * Returns true if the given call executes
 * `goog.tsMigrationExportsShimDeclareLegacyNamespace`.
 */
export declare function isTsmesDeclareLegacyNamespaceCall(n: ts.Node): n is ts.CallExpression;
/**
 * Create code like:
 *
 * goog.loadedModules_['foo.bar'] = {
 *  exports: exports,
 *  type: goog.ModuleType.GOOG,
 *  moduleId: 'foo.bar'
 * };
 *
 * For more info, see `goog.loadModule` in
 * https://github.com/google/closure-library/blob/master/closure/goog/base.js
 */
export declare function createGoogLoadedModulesRegistration(moduleId: string, exports: ts.Expression): ts.Statement;
