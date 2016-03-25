Error at test_files/jsdoc.in.ts:9:1: type annotations (using {...}) are not allowed
Error at test_files/jsdoc.in.ts:20:3: @type annotations are not allowed
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
 */
function jsDocTestBadDoc(foo: string) {}

class JSDocTest {
  /** @export */
  exported: string;

  stringWithoutJSDoc: string;

  /** @type {badType} */
  typedThing: number;

  static _sickle_typeAnnotationsHelper() {
 /** @export
 @type {string} */
    JSDocTest.prototype.exported;
 /** @type {string} */
    JSDocTest.prototype.stringWithoutJSDoc;
 /** @type {number} */
    JSDocTest.prototype.typedThing;
  }

}
