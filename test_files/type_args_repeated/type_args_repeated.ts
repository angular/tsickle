/**
 * @fileoverview Test file to test that tsickle emits consistent closure types
 * when type args are repeated.
 * @suppress {checkTypes}
 */

export {};
class Element<S, T, U> {}

// Recursive type is identified and translated as CLOSURE type UNKNOWN (?)
// tslint:disable-next-line:interface-over-type-literal
type RecursiveType = {
  value: number,
  next: RecursiveType
};

// Repeated but non-recursive TS type {} is identified and translated as CLOSURE
// type ALL (*)
// tslint:disable-next-line:no-inferrable-new-expression
const x: Element<{a: number}, {}, {}> = new Element();
function foo(x: Element<{a: number}, {}, [{}]>): void {}
function bar(x: Element<{}, [{}], [[{}]]>): void {}

foo(x);
bar(x);
