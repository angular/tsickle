Error at test_files/jsdoc/jsdoc.ts:9:1: type annotations (using {...}) are not allowed
Error at test_files/jsdoc/jsdoc.ts:20:3: @type annotations are not allowed
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
