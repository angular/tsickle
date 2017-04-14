Warning at test_files/jsdoc/jsdoc.ts:16:1: the type annotation on @param is redundant with its TypeScript type, remove the {...} part
Warning at test_files/jsdoc/jsdoc.ts:32:3: the type annotation on @export is redundant with its TypeScript type, remove the {...} part
Warning at test_files/jsdoc/jsdoc.ts:37:3: @type annotations are redundant with TypeScript equivalents
Warning at test_files/jsdoc/jsdoc.ts:40:3: @enum annotations are redundant with TypeScript equivalents
Warning at test_files/jsdoc/jsdoc.ts:43:3: the type annotation on @const is redundant with its TypeScript type, remove the {...} part
Warning at test_files/jsdoc/jsdoc.ts:46:3: @typedef annotations are redundant with TypeScript equivalents
Warning at test_files/jsdoc/jsdoc.ts:32:3: the type annotation on @export is redundant with its TypeScript type, remove the {...} part
Warning at test_files/jsdoc/jsdoc.ts:37:3: @type annotations are redundant with TypeScript equivalents
Warning at test_files/jsdoc/jsdoc.ts:40:3: @enum annotations are redundant with TypeScript equivalents
Warning at test_files/jsdoc/jsdoc.ts:43:3: the type annotation on @const is redundant with its TypeScript type, remove the {...} part
Warning at test_files/jsdoc/jsdoc.ts:46:3: @typedef annotations are redundant with TypeScript equivalents
Warning at test_files/jsdoc/jsdoc.ts:50:1: @template annotations are redundant with TypeScript equivalents
Warning at test_files/jsdoc/jsdoc.ts:53:1: use index signatures (`[k: string]: type`) instead of @dict
Warning at test_files/jsdoc/jsdoc.ts:56:1: @lends annotations are redundant with TypeScript equivalents
Warning at test_files/jsdoc/jsdoc.ts:62:1: @this annotations are redundant with TypeScript equivalents
Warning at test_files/jsdoc/jsdoc.ts:65:1: @interface annotations are redundant with TypeScript equivalents
Warning at test_files/jsdoc/jsdoc.ts:74:1: @extends annotations are redundant with TypeScript equivalents
@implements annotations are redundant with TypeScript equivalents
Warning at test_files/jsdoc/jsdoc.ts:81:3: @constructor annotations are redundant with TypeScript equivalents
Warning at test_files/jsdoc/jsdoc.ts:41:3: unhandled anonymous type
====
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */



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
/**
 * \@internal
 */
static X: string[] = [];
/**
 * @export
 */
exported: string;

  /** @export {number} */
  badExport: string;

  stringWithoutJSDoc: string;

  /** @type {badType} */
  typedThing: number;

  /** @enum {string} */
  badEnumThing = {A: 'a'};

  /** @const {string} */
  badConstThing = 'a';

  /** @typedef {string} */
  badTypeDef: string;
}

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

class BadTemplated {}
class BadDict {}
class BadLends {}
/**
 * @throws {Error} JSCompiler treats this as pure documentation, no need to ban it.
 * @return {void}
 */
function fnThrows() {}
/**
 * @return {void}
 */
function badThis() {}
/**
 * @return {void}
 */
function BadInterface() {}
/**
 * \@madeUptag This tag will be escaped, because Closure disallows it.
 * @see This tag will be kept, because Closure allows it.
 * @return {void}
 */
function x(){};
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
/**
 * For example,
 * \@madeUpTag
 */
const c = 'c';
