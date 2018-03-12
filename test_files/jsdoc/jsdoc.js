// Warning at test_files/jsdoc/jsdoc.ts:44:3: unhandled anonymous type
// Warning at test_files/jsdoc/jsdoc.ts:16:1: the type annotation on @param is redundant with its TypeScript type, remove the {...} part
// Warning at test_files/jsdoc/jsdoc.ts:35:3: the type annotation on @export is redundant with its TypeScript type, remove the {...} part
// Warning at test_files/jsdoc/jsdoc.ts:40:3: @type annotations are redundant with TypeScript equivalents
// Warning at test_files/jsdoc/jsdoc.ts:43:3: @enum annotations are redundant with TypeScript equivalents
// Warning at test_files/jsdoc/jsdoc.ts:46:3: the type annotation on @const is redundant with its TypeScript type, remove the {...} part
// Warning at test_files/jsdoc/jsdoc.ts:49:3: @typedef annotations are redundant with TypeScript equivalents
// Warning at test_files/jsdoc/jsdoc.ts:35:3: the type annotation on @export is redundant with its TypeScript type, remove the {...} part
// Warning at test_files/jsdoc/jsdoc.ts:40:3: @type annotations are redundant with TypeScript equivalents
// Warning at test_files/jsdoc/jsdoc.ts:43:3: @enum annotations are redundant with TypeScript equivalents
// Warning at test_files/jsdoc/jsdoc.ts:46:3: the type annotation on @const is redundant with its TypeScript type, remove the {...} part
// Warning at test_files/jsdoc/jsdoc.ts:49:3: @typedef annotations are redundant with TypeScript equivalents
// Warning at test_files/jsdoc/jsdoc.ts:53:1: @template annotations are redundant with TypeScript equivalents
// Warning at test_files/jsdoc/jsdoc.ts:56:1: use index signatures (`[k: string]: type`) instead of @dict
// Warning at test_files/jsdoc/jsdoc.ts:59:1: @lends annotations are redundant with TypeScript equivalents
// Warning at test_files/jsdoc/jsdoc.ts:65:1: @this annotations are redundant with TypeScript equivalents
// Warning at test_files/jsdoc/jsdoc.ts:68:1: @interface annotations are redundant with TypeScript equivalents
// Warning at test_files/jsdoc/jsdoc.ts:77:1: @extends annotations are redundant with TypeScript equivalents
// @implements annotations are redundant with TypeScript equivalents
// Warning at test_files/jsdoc/jsdoc.ts:84:3: @constructor annotations are redundant with TypeScript equivalents
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.jsdoc.jsdoc');var module = module || {id: 'test_files/jsdoc/jsdoc.js'};/**
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
        /**
         * \@internal
         */
        this.x = [];
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
/**
 * \@internal
 * @type {!Array<string>}
 */
JSDocTest.X;
/**
 * \@internal
 * @type {!Array<string>}
 */
JSDocTest.prototype.x;
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
const /** @type {string} */ c = 'c';
/**
 * Don't emit type comments for Polymer behaviors,
 * as this breaks their closure plugin :-(
 *
 * @polymerBehavior
 */
const somePolymerBehavior = {};
/**
 * Don't emit type comments for Polymer behaviors
 * if they are declared via the Polymer function.
 */
let /** @type {?} */ Polymer;
Polymer({ behaviors: ['test'] });
