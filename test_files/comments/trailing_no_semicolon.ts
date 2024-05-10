/**
 * @fileoverview Tests that the JSDoc comment of `other` is only emitted once.
 * Without the trailing semicolon after `noExplicitSemicolon` TypeScript seems
 * to duplicate the trailing comment as soon as a custom transformer modifies
 * the variable statement.
 */


const noExplicitSemicolon = 0

/**
 * This is a comment with a JSDoc tag
 * JSCompiler doesn't recognize
 *
 * @foobar
 */
export const other = 1;
