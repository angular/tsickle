goog.module('tsickle_test.jsdoc');/**
 * @param {string} foo a string.
 * @param {string} baz
 * @return {string} return comment.
 */
function jsDocTestFunction(foo, baz) {
    return foo;
}
/**
 * @param {string} foo
 * @return {void}
 */
function jsDocTestBadDoc(foo) { }
class JSDocTest {
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
