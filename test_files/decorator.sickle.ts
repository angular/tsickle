
/**
 * @param { Object} a
 * @param { string}  b
 */
function decorator(a: Object, b: string) {}

class DecoratorTest {
  @decorator
private x: number;
_sickle_typeAnnotationsHelper() {
 /** @type { number} */
this.x;
}

}
