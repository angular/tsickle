goog.module('test_files.jsdoc.jsdoc');var module = module || {id: 'test_files/jsdoc/jsdoc.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */
/**
 * @param {string} foo a string.
 * @param {string} baz
 * @return {string} return comment.
 */
function jsDocTestFunction(foo, baz) {
    return foo;
}
/**
 * @return {string} return comment in a "\@returns" block.
 */
function returnsTest() {
    return 'abc';
}
/**
 * @param {string} foo
 * @return {void}
 */
function jsDocTestBadDoc(foo) { }
/**
 * Test JS doc on class.
 * \@madeUpTag This tag will be escaped, because Closure disallows it.
 */
class JSDocTest {
    constructor() {
        /** @enum {string} */
        this.badEnumThing = { A: 'a' };
        /** @const {string} */
        this.badConstThing = 'a';
    }
}
/**
 * \@internal
 */
JSDocTest.X = [];
function JSDocTest_tsickle_Closure_declarations() {
    /**
     * \@internal
     * @type {!Array<string>}
     */
    JSDocTest.X;
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
    /** @type {?} */
    JSDocTest.prototype.badEnumThing;
    /** @type {string} */
    JSDocTest.prototype.badConstThing;
    /** @type {string} */
    JSDocTest.prototype.badTypeDef;
}
class BadTemplated {
}
class BadDict {
}
class BadLends {
}
/**
 * @throws {Error} JSCompiler treats this as pure documentation, no need to ban it.
 * @return {void}
 */
function fnThrows() { }
/**
 * @return {void}
 */
function badThis() { }
/**
 * @return {void}
 */
function BadInterface() { }
/**
 * \@madeUptag This tag will be escaped, because Closure disallows it.
 * @see This tag will be kept, because Closure allows it.
 * @return {void}
 */
function x() { }
;
/**
 * This class has JSDoc, but some of it should be stripped.
 * @see Nothing.
 */
class RedundantJSDocShouldBeStripped {
    constructor() { }
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
function JSDocWithBadTag() { }
/**
 * For example,
 * \@madeUpTag
 */
const c = 'c';
