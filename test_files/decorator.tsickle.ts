
/**
 * @param {Object} a
 * @param {string} b
 * @return {void}
 */
function decorator(a: Object, b: string) {}

class DecoratorTest {
  @decorator
private x: number;

  static _tsickle_typeAnnotationsHelper() {
 /** @type {number} */
DecoratorTest.prototype.x;
  }

}
