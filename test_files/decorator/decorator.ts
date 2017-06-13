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

@classAnnotation
class DecoratorTest {
  constructor(a: any[], n: number, b: boolean, promise: Promise<string>, arr: Array<string>, aClass: AClass, aClassWithGenerics: AClassWithGenerics<string>, aType: AType) {}

  @decorator
  private x: number;

  @annotationDecorator
  private y: number;

  @decorator
  private z: AClass;
}

@classDecorator
class DecoratedClass {
  z: string;
}