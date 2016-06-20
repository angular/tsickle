Error at test_files/jsdoc/jsdoc.ts:16:1: type annotations (using {...}) are not allowed
Error at test_files/jsdoc/jsdoc.ts:27:3: @type annotations are not allowed
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
 * @return {string} return comment in a "@returns" block.
 */
function returnsTest(): string {
  return 'abc';
}
/**
 * @param {string} foo
 * @return {void}
 */
function jsDocTestBadDoc(foo: string) {}

class JSDocTest {
  /** @export */
  exported: string;

  stringWithoutJSDoc: string;

  /** @type {badType} */
  typedThing: number;

  static _tsickle_typeAnnotationsHelper() {
 /** @export
 @type {string} */
JSDocTest.prototype.exported;
 /** @type {string} */
JSDocTest.prototype.stringWithoutJSDoc;
 /** @type {number} */
JSDocTest.prototype.typedThing;
  }

}
