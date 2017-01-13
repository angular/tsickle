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
