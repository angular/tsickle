/**
 * @ExportDecoratedItemsIfPublic
 */
function exportDecoratedIfPublic() {
  return (protoOrDescriptor: unknown, name?: PropertyKey): void => {};
}

class ExportDecoratedClass {
  @exportDecoratedIfPublic() implicitPublicProp = 0;
  @exportDecoratedIfPublic() public publicProp = 0;
  @exportDecoratedIfPublic() protected protectedProp = 0;
  @exportDecoratedIfPublic() private privateProp = 0;

  @exportDecoratedIfPublic()
  implicitPublicMethod() {
  }
  @exportDecoratedIfPublic()
  public publicMethod() {
  };
  @exportDecoratedIfPublic()
  protected protectedMethod() {
  };
  @exportDecoratedIfPublic()
  private privateMethod() {
  };
}

export {};
