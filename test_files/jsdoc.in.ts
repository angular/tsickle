/**
 * @param foo a string.
 * @return return comment.
 */
function jsDocTestFunction(foo: string, baz: string): string {
  return foo;
}

/**
 * @param {badTypeHere} foo no types allowed.
 */
function jsDocTestBadDoc(foo: string) {}

class JSDocTest {
  /** @export */
  exported: string;

  stringWithoutJSDoc: string;

  /** @type {badType} */
  typedThing: number;
}
