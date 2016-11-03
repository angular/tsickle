function decorator(a: Object, b: string) {}

/** @Annotation */
function annotationDecorator(a: Object, b: string) {}

function classDecorator(t: any) { return t; }

/** @Annotation */
function classAnnotation(t: any) { return t; }

@classAnnotation
class DecoratorTest {
  @decorator
  private x: number;

  @annotationDecorator
  private y: number;
}

@classDecorator
class DecoratedClass {
  z: string;
}
