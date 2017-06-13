import {AClass, AType, AClassWithGenerics} from './external';

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
  constructor(a: any[], n: number, b: boolean, promise: Promise<string>, arr: Array<string>, aClass: AClass, aClassWithGenerics: AClassWithGenerics<string>, aType: AType) {}

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
null, null,
{type: Promise, },
{type: Array, },
{type: AClass, },
{type: AClassWithGenerics, },
null,];
static propDecorators: {[key: string]: {type: Function, args?: any[]}[]} = {
"y": [{ type: annotationDecorator },],
};
}

@classDecorator
class DecoratedClass {
  z: string;
}