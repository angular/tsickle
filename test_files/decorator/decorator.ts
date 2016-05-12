function decorator(a: Object, b: string) {}

class DecoratorTest {
  @decorator
  private x: number;
}
