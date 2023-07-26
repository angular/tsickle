/**
 * @fileoverview
 * @suppress {uselessCode}
 */

/**
 * @param foo a string.
 * @return return comment.
 */
function jsDocTestFunction(foo: string, baz: string): string {
  return foo;
}

/**
 * @returns return comment in a "@returns" block.
 */
function returnsTest(): string {
  return 'abc';
}

/**
 * @param {badTypeHere} foo no types allowed.
 */
function jsDocTestBadDoc(foo: string) {}

/**
 * Test JS doc on class.
 * @madeUpTag This tag will be escaped, because Closure disallows it.
 * @param What does this even mean?
 */
class JSDocTest {
  /** @internal */
  static X: string[] = [];

  /** @internal */
  x: string[] = [];

  /** @export */
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

/** @param What does this even mean? */
interface MyInterface {}

/** @template T */
class BadTemplated {}

/** @dict */
class BadDict {}

/** @lends {BadDict} */
class BadLends {}

/**
 * @throws {Error} JSCompiler treats this as pure documentation, no need to ban
 *     it.
 */
function fnThrows() {}

/** @this {string} */
function badThis() {}

/** @interface @record */
function BadInterface() {}

/**
 * @madeUptag This tag will be escaped, because Closure disallows it.
 * @see This tag will be kept, because Closure allows it.
 */
function x() {};

/**
 * This class has JSDoc, but some of it should be stripped.
 * @extends {IgnoreMe}
 * @implements {IgnoreMeToo}
 * @see Nothing.
 */
class RedundantJSDocShouldBeStripped {
  /** @constructor */
  constructor() {}
}

/**
 * This comment has code that needs to be escaped to pass Closure checking.
 * @example
 *
 *   @Reflect
 *   function example() {}
 *   @Reflect.metadata(foo, bar)
 *   function example2() {}
 */
function JSDocWithBadTag() {}

/**
 * For example,
 * @madeUpTag
 */
const c = 'c';

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
let Polymer: any;
Polymer({behaviors: ['test' as any]});

/**
 * This class has a 'template' tag, which we want to allow (because this is
 * how to doc this) but not let Closure interpret (because we emit our own).
 * The desired behavior is that the user-written @template comment (which
 * talks about T) is dropped, but the tsickle-generated @template comment
 * (which talks about T2) is preserved.
 *
 * @template T User-written comments on the template (typo of 'T1').
 * @template T2 Another user comment.
 */
class Foo<T1, T2> {}

/**
 * @define {boolean}
 */
const DEFINE_WITH_JSDOC_TYPE = 42;

/**
 * @define
 */
const DEFINE_WITH_INFERRED_TYPE = false;

/**
 * @define
 */
const DEFINE_WITH_DECLARED_TYPE: string = 'y';

/** @logTypeInCompiler */
const logTypeInCompiler = 0;
