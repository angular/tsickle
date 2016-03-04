
/**
 * @param { string} foo a string.
 * @param { string} baz
 * @return { string} return comment.
 */
function jsDocTestFunction(foo: string, baz: string): string {
  return foo;
}

class JSDocTest {
  /** @export */
  exported: string;

  ordinaryString: string;

  static _sickle_typeAnnotationsHelper() {
 /** @export
@type { string} */
    JSDocTest.prototype.exported;
 /** @type { string} */
    JSDocTest.prototype.ordinaryString;
  }

}
