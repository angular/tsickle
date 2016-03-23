
/**
 * @param {Object} a
 * @param {string} b
 */
function decorator(a: Object, b: string) {}

class DecoratorTest {
  @decorator
private x: number;

  static _sickle_typeAnnotationsHelper() {
 /** @type {number} */
    DecoratorTest.prototype.x;
  }

}
