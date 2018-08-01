/**
 * @fileoverview Tests that mere mentions of file overview tags in comment bodies don't get
 * reported as errors.
 */

/**
 * This is a function comment that talks about @fileoverview, but isn't such a comment.
 */
export function foo() {}
