"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoogLoadedModulesRegistration = exports.isTsmesDeclareLegacyNamespaceCall = exports.isTsmesShorthandCall = exports.isAnyTsmesCall = exports.isGoogCallExpressionOf = exports.getGoogFunctionName = exports.createGoogCall = exports.getAllLeadingComments = exports.reportDiagnostic = exports.reportDebugWarning = exports.createMultiLineComment = exports.createSingleLineComment = exports.createSingleQuoteStringLiteral = exports.updateSourceFileNode = exports.visitEachChild = exports.createNotEmittedStatement = exports.synthesizeCommentRanges = exports.createNotEmittedStatementWithComments = exports.unescapeName = exports.getEntityNameText = exports.symbolIsValue = exports.getIdentifierText = exports.isDtsFileName = exports.isAmbient = exports.hasModifierFlag = void 0;
const ts = require("typescript");
/** @return true if node has the specified modifier flag set. */
function hasModifierFlag(declaration, flag) {
    return (ts.getCombinedModifierFlags(declaration) & flag) !== 0;
}
exports.hasModifierFlag = hasModifierFlag;
/**
 * @return true if node or one of its ancestors has the Ambient modifier flag
 *     set.
 */
function isAmbient(node) {
    let current = node;
    while (current) {
        if (hasModifierFlag(current, ts.ModifierFlags.Ambient)) {
            return true;
        }
        current = current.parent;
    }
    return false;
}
exports.isAmbient = isAmbient;
/** Returns true if fileName is a .d.ts file. */
function isDtsFileName(fileName) {
    return fileName.endsWith('.d.ts');
}
exports.isDtsFileName = isDtsFileName;
/** Returns the string contents of a ts.Identifier. */
function getIdentifierText(identifier) {
    // NOTE: 'escapedText' on an Identifier may be escaped if it starts with '__'. The alternative,
    // getText(), cannot be used on synthesized nodes, so unescape the identifier below.
    return unescapeName(identifier.escapedText);
}
exports.getIdentifierText = getIdentifierText;
/**
 * Returns true if the given symbol refers to a value (as distinct from a type).
 *
 * Expands aliases, which is important for the case where
 *   import * as x from 'some-module';
 * and x is now a value (the module object).
 */
function symbolIsValue(tc, sym) {
    if (sym.flags & ts.SymbolFlags.Alias)
        sym = tc.getAliasedSymbol(sym);
    return (sym.flags & ts.SymbolFlags.Value) !== 0;
}
exports.symbolIsValue = symbolIsValue;
/** Returns a dot-joined qualified name (foo.bar.Baz). */
function getEntityNameText(name) {
    if (ts.isIdentifier(name)) {
        return getIdentifierText(name);
    }
    return getEntityNameText(name.left) + '.' + getIdentifierText(name.right);
}
exports.getEntityNameText = getEntityNameText;
/**
 * Converts an escaped TypeScript name into the original source name.
 */
function unescapeName(name) {
    // See the private function unescapeIdentifier in TypeScript's utilities.ts.
    const str = name;
    if (str.startsWith('___'))
        return str.substring(1);
    return str;
}
exports.unescapeName = unescapeName;
/**
 * ts.createNotEmittedStatement will create a node, but the comments covered by its text range are
 * never emittedm except for very specific special cases (/// comments).
 *
 * createNotEmittedStatementWithComments creates a not emitted statement and adds comment ranges
 * from the original statement as synthetic comments to it, so that they get retained in the output.
 */
function createNotEmittedStatementWithComments(sourceFile, original) {
    let replacement = ts.factory.createNotEmittedStatement(original);
    // NB: synthetic nodes can have pos/end == -1. This is handled by the underlying implementation.
    const leading = ts.getLeadingCommentRanges(sourceFile.text, original.pos) || [];
    const trailing = ts.getTrailingCommentRanges(sourceFile.text, original.end) || [];
    replacement =
        ts.setSyntheticLeadingComments(replacement, synthesizeCommentRanges(sourceFile, leading));
    replacement =
        ts.setSyntheticTrailingComments(replacement, synthesizeCommentRanges(sourceFile, trailing));
    return replacement;
}
exports.createNotEmittedStatementWithComments = createNotEmittedStatementWithComments;
/**
 * Converts `ts.CommentRange`s into `ts.SynthesizedComment`s.
 */
function synthesizeCommentRanges(sourceFile, parsedComments) {
    const synthesizedComments = [];
    parsedComments.forEach(({ kind, pos, end, hasTrailingNewLine }) => {
        let commentText = sourceFile.text.substring(pos, end).trim();
        if (kind === ts.SyntaxKind.MultiLineCommentTrivia) {
            commentText = commentText.replace(/(^\/\*)|(\*\/$)/g, '');
        }
        else if (kind === ts.SyntaxKind.SingleLineCommentTrivia) {
            if (commentText.startsWith('///')) {
                // triple-slash comments are typescript specific, ignore them in the output.
                return;
            }
            commentText = commentText.replace(/(^\/\/)/g, '');
        }
        synthesizedComments.push({ kind, text: commentText, hasTrailingNewLine, pos: -1, end: -1 });
    });
    return synthesizedComments;
}
exports.synthesizeCommentRanges = synthesizeCommentRanges;
/**
 * Creates a non emitted statement that can be used to store synthesized comments.
 */
function createNotEmittedStatement(sourceFile) {
    const stmt = ts.factory.createNotEmittedStatement(sourceFile);
    ts.setOriginalNode(stmt, undefined);
    ts.setTextRange(stmt, { pos: 0, end: 0 });
    ts.setEmitFlags(stmt, ts.EmitFlags.CustomPrologue);
    return stmt;
}
exports.createNotEmittedStatement = createNotEmittedStatement;
/**
 * This is a version of `ts.visitEachChild` that works that calls our version
 * of `updateSourceFileNode`, so that typescript doesn't lose type information
 * for property decorators.
 * See https://github.com/Microsoft/TypeScript/issues/17384
 */
function visitEachChild(node, visitor, context) {
    if (node.kind === ts.SyntaxKind.SourceFile) {
        const sf = node;
        return updateSourceFileNode(sf, ts.visitLexicalEnvironment(sf.statements, visitor, context));
    }
    return ts.visitEachChild(node, visitor, context);
}
exports.visitEachChild = visitEachChild;
/**
 * This is a version of `ts.updateSourceFileNode` that works
 * well with property decorators.
 * See https://github.com/Microsoft/TypeScript/issues/17384
 * TODO(#634): This has been fixed in TS 2.5. Investigate removal.
 */
function updateSourceFileNode(sf, statements) {
    if (statements === sf.statements) {
        return sf;
    }
    sf = ts.factory.updateSourceFile(sf, statements, sf.isDeclarationFile, sf.referencedFiles, sf.typeReferenceDirectives, sf.hasNoDefaultLib, sf.libReferenceDirectives);
    return sf;
}
exports.updateSourceFileNode = updateSourceFileNode;
/**
 * Creates a string literal that uses single quotes. Purely cosmetic, but increases fidelity to the
 * existing test suite.
 */
function createSingleQuoteStringLiteral(text) {
    const stringLiteral = ts.factory.createStringLiteral(text);
    // tslint:disable-next-line:no-any accessing TS internal API.
    stringLiteral['singleQuote'] = true;
    return stringLiteral;
}
exports.createSingleQuoteStringLiteral = createSingleQuoteStringLiteral;
/** Creates a not emitted statement with the given text as a single line comment. */
function createSingleLineComment(original, text) {
    const comment = {
        kind: ts.SyntaxKind.SingleLineCommentTrivia,
        text: ' ' + text,
        hasTrailingNewLine: true,
        pos: -1,
        end: -1,
    };
    return ts.setSyntheticTrailingComments(ts.factory.createNotEmittedStatement(original), [comment]);
}
exports.createSingleLineComment = createSingleLineComment;
/** Creates a not emitted statement with the given text as a single line comment. */
function createMultiLineComment(original, text) {
    const comment = {
        kind: ts.SyntaxKind.MultiLineCommentTrivia,
        text: ' ' + text,
        hasTrailingNewLine: true,
        pos: -1,
        end: -1,
    };
    return ts.setSyntheticTrailingComments(ts.factory.createNotEmittedStatement(original), [comment]);
}
exports.createMultiLineComment = createMultiLineComment;
/**
 * debugWarn logs a debug warning.
 *
 * These should only be used for cases where tsickle is making a questionable judgement about what
 * to do. By default, tsickle does not report any warnings to the caller, and warnings are hidden
 * behind a debug flag, as warnings are only for tsickle to debug itself.
 */
function reportDebugWarning(host, node, messageText) {
    if (!host.logWarning)
        return;
    host.logWarning(createDiagnostic(node, messageText, /* textRange */ undefined, ts.DiagnosticCategory.Warning));
}
exports.reportDebugWarning = reportDebugWarning;
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
function reportDiagnostic(diagnostics, node, messageText, textRange, category = ts.DiagnosticCategory.Error) {
    diagnostics.push(createDiagnostic(node, messageText, textRange, category));
}
exports.reportDiagnostic = reportDiagnostic;
function createDiagnostic(node, messageText, textRange, category) {
    let start, length;
    // getStart on a synthesized node can crash (due to not finding an associated
    // source file). Make sure to use the original node.
    node = ts.getOriginalNode(node);
    if (textRange) {
        start = textRange.pos;
        length = textRange.end - textRange.pos;
    }
    else {
        // Only use getStart if node has a valid pos, as it might be synthesized.
        start = node.pos >= 0 ? node.getStart() : 0;
        length = node.end - node.pos;
    }
    return {
        file: node.getSourceFile(),
        start,
        length,
        messageText,
        category,
        code: 0,
    };
}
/**
 * A replacement for ts.getLeadingCommentRanges that returns the union of synthetic and
 * non-synthetic comments on the given node, with their text included. The returned comments must
 * not be mutated, as their content might or might not be reflected back into the AST.
 */
function getAllLeadingComments(node) {
    const allRanges = [];
    const nodeText = node.getFullText();
    const cr = ts.getLeadingCommentRanges(nodeText, 0);
    if (cr)
        allRanges.push(...cr.map(c => (Object.assign(Object.assign({}, c), { text: nodeText.substring(c.pos, c.end) }))));
    const synthetic = ts.getSyntheticLeadingComments(node);
    if (synthetic)
        allRanges.push(...synthetic);
    return allRanges;
}
exports.getAllLeadingComments = getAllLeadingComments;
/**
 * Creates a call expression corresponding to `goog.${methodName}(${literal})`.
 */
function createGoogCall(methodName, literal) {
    return ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('goog'), methodName), undefined, [literal]);
}
exports.createGoogCall = createGoogCall;
/**
 * Returns the function name called in the given call expression (vis. returns
 * `$fnName` when pased `goog.$fnName`), or null if the given call expression is
 * not of the form `goog.$fnName`.
 */
function getGoogFunctionName(call) {
    if (!ts.isPropertyAccessExpression(call.expression)) {
        return null;
    }
    const propAccess = call.expression;
    if (!ts.isIdentifier(propAccess.expression) ||
        propAccess.expression.escapedText !== 'goog') {
        return null;
    }
    return propAccess.name.text;
}
exports.getGoogFunctionName = getGoogFunctionName;
/**
 * Returns true if the given call executes `goog.$fnName`. Does
 * not check whether `goog` is the expected symbol (vs e.g. a local variable).
 */
function isGoogCallExpressionOf(n, fnName) {
    return ts.isCallExpression(n) && getGoogFunctionName(n) === fnName;
}
exports.isGoogCallExpressionOf = isGoogCallExpressionOf;
/**
 * Returns true if the given call executes `goog.tsMigrationExportsShim`,
 * `goog.tsMigrationNamedExportsShim`, or `goog.tsMigrationDefaultExportsShim`.
 * Does not check whether `goog` is the expected symbol (vs e.g. a local
 * variable).
 */
function isAnyTsmesCall(n) {
    return isGoogCallExpressionOf(n, 'tsMigrationExportsShim') ||
        isGoogCallExpressionOf(n, 'tsMigrationDefaultExportsShim') ||
        isGoogCallExpressionOf(n, 'tsMigrationNamedExportsShim');
}
exports.isAnyTsmesCall = isAnyTsmesCall;
/**
 * Returns true if the given call executes `goog.tsMigrationNamedExportsShim`,
 * or `goog.tsMigrationDefaultExportsShim`, ie one of the tsmes methods that
 * only take one argument. Does not check whether `goog` is the expected symbol
 * (vs e.g. a local variable).
 */
function isTsmesShorthandCall(n) {
    return isGoogCallExpressionOf(n, 'tsMigrationDefaultExportsShim') ||
        isGoogCallExpressionOf(n, 'tsMigrationNamedExportsShim');
}
exports.isTsmesShorthandCall = isTsmesShorthandCall;
/**
 * Returns true if the given call executes
 * `goog.tsMigrationExportsShimDeclareLegacyNamespace`.
 */
function isTsmesDeclareLegacyNamespaceCall(n) {
    return isGoogCallExpressionOf(n, 'tsMigrationExportsShimDeclareLegacyNamespace');
}
exports.isTsmesDeclareLegacyNamespaceCall = isTsmesDeclareLegacyNamespaceCall;
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
function createGoogLoadedModulesRegistration(moduleId, exports) {
    return ts.factory.createExpressionStatement(ts.factory.createAssignment(ts.factory.createElementAccessExpression(ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('goog'), ts.factory.createIdentifier('loadedModules_')), createSingleQuoteStringLiteral(moduleId)), ts.factory.createObjectLiteralExpression([
        ts.factory.createPropertyAssignment('exports', exports),
        ts.factory.createPropertyAssignment('type', ts.factory.createPropertyAccessExpression(ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('goog'), ts.factory.createIdentifier('ModuleType')), ts.factory.createIdentifier('GOOG'))),
        ts.factory.createPropertyAssignment('moduleId', createSingleQuoteStringLiteral(moduleId)),
    ])));
}
exports.createGoogLoadedModulesRegistration = createGoogLoadedModulesRegistration;
//# sourceMappingURL=transformer_util.js.map