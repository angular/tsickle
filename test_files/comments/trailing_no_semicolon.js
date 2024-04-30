/**
 * @fileoverview Tests that the JSDoc comment of `other` is only emitted once.
 * Without the trailing semicolon after `noExplicitSemicolon` TypeScript seems
 * to duplicate the trailing comment as soon as a custom transformer modifies
 * the variable statement.
 * Generated from: test_files/comments/trailing_no_semicolon.ts
 */
goog.module('test_files.comments.trailing_no_semicolon');
var module = module || { id: 'test_files/comments/trailing_no_semicolon.ts' };
goog.require('tslib');
/** @type {number} */
const noExplicitSemicolon = 0;
/**
 * This is a comment with a JSDoc tag
 * JSCompiler doesn't recognize
 *
 * \@foobar
 * @type {number}
 */
exports.other = 1;
