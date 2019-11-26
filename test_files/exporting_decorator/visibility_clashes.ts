/**
 * @ExportDecoratedItems
 */
function exportDecorated() {
  return (protoOrDescriptor: unknown, name?: PropertyKey): void => {};
}

class ExportDecoratedClass {
  @exportDecorated() implicitPublicProp = 0;
  @exportDecorated() publicProp = 0;
  @exportDecorated() protected protectedProp = 0;
  @exportDecorated() private privateProp = 0;

  @exportDecorated()
  implicitPublicMethod() {
  }
  @exportDecorated()
  publicMethod() {
  }
  @exportDecorated()
  protected protectedMethod() {
  }
  @exportDecorated()
  private privateMethod() {
  }
}

export {};
