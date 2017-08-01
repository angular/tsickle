// OtherClass is reachable via the imports for './external' and './external2'.
// Test that were using it from the right import, and not just the first
// that allows access to the value. That is important when imports are elided.
import {AClass, AClass as ARenamedClass, AType, AClassWithGenerics, ReexportedOtherClass} from './external';
import {OtherClass} from './external2';

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


class DecoratorTest {
  constructor(a: any[], n: number, b: boolean, promise: Promise<string>, arr: Array<string>,
    aClass: AClass, AClass: AClass, aRenamedClass: ARenamedClass,
    aClassWithGenerics: AClassWithGenerics<string>, aType: AType,
    otherClass: OtherClass, anotherClass: ReexportedOtherClass) {}

  
  get w(): number {
    return 1;
  }

  /** Some comment */
  @decorator
  private x: number;

  
  private y: number;

  @decorator
  private z: AClass;
static decorators: {type: Function, args?: any[]}[] = [
{ type: classAnnotation },
];
/** @nocollapse */
static ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [
{type: Array, },
null,
null,
{type: Promise, },
{type: Array, },
{type: AClass, },
{type: AClass, },
{type: ARenamedClass, },
{type: AClassWithGenerics, },
null,
{type: OtherClass, },
{type: ReexportedOtherClass, },
];
static propDecorators: {[key: string]: {type: Function, args?: any[]}[]} = {
"w": [{ type: annotationDecorator },],
"y": [{ type: annotationDecorator },],
};
}

@classDecorator
class DecoratedClass {
  z: string;
}