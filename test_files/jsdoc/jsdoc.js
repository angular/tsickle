// test_files/jsdoc/jsdoc.ts(16,1): warning TS0: the type annotation on @param is redundant with its TypeScript type, remove the {...} part
// test_files/jsdoc/jsdoc.ts(35,3): warning TS0: the type annotation on @export is redundant with its TypeScript type, remove the {...} part
// test_files/jsdoc/jsdoc.ts(40,3): warning TS0: @type annotations are redundant with TypeScript equivalents
// test_files/jsdoc/jsdoc.ts(43,3): warning TS0: @enum annotations are redundant with TypeScript equivalents
// test_files/jsdoc/jsdoc.ts(46,3): warning TS0: the type annotation on @const is redundant with its TypeScript type, remove the {...} part
// test_files/jsdoc/jsdoc.ts(49,3): warning TS0: @typedef annotations are redundant with TypeScript equivalents
// test_files/jsdoc/jsdoc.ts(35,3): warning TS0: the type annotation on @export is redundant with its TypeScript type, remove the {...} part
// test_files/jsdoc/jsdoc.ts(40,3): warning TS0: @type annotations are redundant with TypeScript equivalents
// test_files/jsdoc/jsdoc.ts(43,3): warning TS0: @enum annotations are redundant with TypeScript equivalents
// test_files/jsdoc/jsdoc.ts(46,3): warning TS0: the type annotation on @const is redundant with its TypeScript type, remove the {...} part
// test_files/jsdoc/jsdoc.ts(49,3): warning TS0: @typedef annotations are redundant with TypeScript equivalents
// test_files/jsdoc/jsdoc.ts(56,1): warning TS0: use index signatures (`[k: string]: type`) instead of @dict
// test_files/jsdoc/jsdoc.ts(59,1): warning TS0: @lends annotations are redundant with TypeScript equivalents
// test_files/jsdoc/jsdoc.ts(65,1): warning TS0: @this annotations are redundant with TypeScript equivalents
// test_files/jsdoc/jsdoc.ts(68,1): warning TS0: @interface annotations are redundant with TypeScript equivalents
// test_files/jsdoc/jsdoc.ts(77,1): warning TS0: @extends annotations are redundant with TypeScript equivalents
// @implements annotations are redundant with TypeScript equivalents
// test_files/jsdoc/jsdoc.ts(84,3): warning TS0: @constructor annotations are redundant with TypeScript equivalents
// test_files/jsdoc/jsdoc.ts(132,1): warning TS0: the type annotation on @define is redundant with its TypeScript type, remove the {...} part
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.jsdoc.jsdoc');
var module = module || { id: 'test_files/jsdoc/jsdoc.ts' };
module = module;
exports = {};
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
        /**
         * \@internal
         */
        this.x = [];
        this.badEnumThing = { A: 'a' };
        this.badConstThing = 'a';
    }
}
/**
 * \@internal
 */
JSDocTest.X = [];
if (false) {
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
    /** @type {{A: string}} */
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
 * \@Reflect
 *   function example() {}
 * \@Reflect.metadata(foo, bar)
 *   function example2() {}
 * @return {void}
 */
function JSDocWithBadTag() { }
/**
 * For example,
 * \@madeUpTag
 * @type {string}
 */
const c = 'c';
/**
 * Don't emit type comments for Polymer behaviors,
 * as this breaks their closure plugin :-(
 *
 * @polymerBehavior
 * @type {*}
 */
const somePolymerBehavior = {};
/**
 * Don't emit type comments for Polymer behaviors
 * if they are declared via the Polymer function.
 * @type {?}
 */
let Polymer;
Polymer({ behaviors: [(/** @type {?} */ ('test'))] });
/**
 * This class has a 'template' tag, which we want to allow (because this is
 * how to doc this) but not let Closure interpret (because we emit our own).
 * The desired behavior is that the user-written \@template comment (which
 * talks about T) is dropped, but the tsickle-generated \@template comment
 * (which talks about T2) is preserved.
 *
 * @template T1, T2
 */
class Foo {
}
/** @type {number} */
const DEFINE_WITH_JSDOC_TYPE = 42;
/**
 * @define {boolean}
 */
const DEFINE_WITH_INFERRED_TYPE = false;
/**
 * @define {string}
 */
const DEFINE_WITH_DECLARED_TYPE = 'y';
