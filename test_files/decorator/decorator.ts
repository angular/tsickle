function decorator(a: Object, b: string) {}

/** @Annotation */
function annotationDecorator(a: Object, b: string) {}

function classDecorator(t: any) { return t; }

type classAnnotation = {};
// should not matter, but getDeclarations() returns this node too.
// Comment comes after statement so that type alias does not have
// a comment on its own.

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
