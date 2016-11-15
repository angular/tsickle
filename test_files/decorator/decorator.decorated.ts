function decorator(a: Object, b: string) {}

/** @Annotation */
function annotationDecorator(a: Object, b: string) {}

function classDecorator(t: any) { return t; }

/** @Annotation */
function classAnnotation(t: any) { return t; }


class DecoratorTest {
  @decorator
  private x: number;

  
  private y: number;
static decorators: DecoratorInvocation[] = [
{ type: classAnnotation },
];
/** @nocollapse */
static ctorParameters: () => ({type: any, decorators?: DecoratorInvocation[]}|null)[] = () => [
];
static propDecorators: {[key: string]: DecoratorInvocation[]} = {
'y': [{ type: annotationDecorator },],
};
}

@classDecorator
class DecoratedClass {
  z: string;
}

interface DecoratorInvocation {
  type: Function;
  args?: any[];
}
