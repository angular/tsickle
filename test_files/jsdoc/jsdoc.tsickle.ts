Warning at test_files/jsdoc/jsdoc.ts:16:1: type annotations (using {...}) are redundant with TypeScript types
Warning at test_files/jsdoc/jsdoc.ts:29:3: type annotations (using {...}) are redundant with TypeScript types
Warning at test_files/jsdoc/jsdoc.ts:34:3: @type annotations are redundant with TypeScript equivalents
Warning at test_files/jsdoc/jsdoc.ts:44:1: @extends annotations are redundant with TypeScript equivalents
@implements annotations are redundant with TypeScript equivalents
Warning at test_files/jsdoc/jsdoc.ts:51:3: @constructor annotations are redundant with TypeScript equivalents
====

/**
 * @param {string} foo a string.
 * @param {string} baz
 * @return {string} return comment.
 */
function jsDocTestFunction(foo: string, baz: string): string {
  return foo;
}
/**
 * @return {string} return comment in a "\@returns" block.
 */
function returnsTest(): string {
  return 'abc';
}
/**
 * @param {string} foo
 * @return {void}
 */
function jsDocTestBadDoc(foo: string) {}
/**
 * Test JS doc on class.
 * \@madeUpTag This tag will be escaped, because Closure disallows it.
 */
class JSDocTest {
  /** @export */
  exported: string;

  /** @export {number} */
  badExport: string;

  stringWithoutJSDoc: string;

  /** @type {badType} */
  typedThing: number;
}

function JSDocTest_tsickle_Closure_declarations() {
/**
 * @export
 * @type {string}
 */
JSDocTest.prototype.exported;
/** @type {string} */
JSDocTest.prototype.badExport;
/** @type {string} */
JSDocTest.prototype.stringWithoutJSDoc;
/** @type {number} */
JSDocTest.prototype.typedThing;
}

/**
 * \@madeUptag This tag will be escaped, because Closure disallows it.
 * @see This tag will be kept, because Closure allows it.
 * @return {void}
 */
function x() {};
/**
 * This class has JSDoc, but some of it should be stripped.
 * @see Nothing.
 */
class RedundantJSDocShouldBeStripped {
constructor() {}
}
/**
 * This comment has code that needs to be escaped to pass Closure checking.
 * \@example 
 * 
 *   \@Reflect
 *   function example() {}
 *   \@Reflect.metadata(foo, bar)
 *   function example2() {}
 * @return {void}
 */
function JSDocWithBadTag() {}
