/**
 * This overload has docs and a tag.
 * @param x is a string here
 * @export
 */
declare function foo(x: number);
/**
 * This overload has the same.
 * @param x is a number here.
 * @export
 */
declare function foo(x: number);
/**
 * And here is the actual implementation.
 * @export
 */
declare function foo(x: string|number);
