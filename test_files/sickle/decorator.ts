
/**
 * @param { Object} a
 * @param { string}  b
 */
function decorator(a: Object, b: string) {}

class DecoratorTest {
  @decorator
  private x: number;
// Sickle: begin synthetic ctor.
constructor() {


// Sickle: begin stub declarations.

 /** @type { number} */
this.x;
// Sickle: end stub declarations.
}

}
