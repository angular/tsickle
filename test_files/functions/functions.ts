/**
 * @fileoverview
 * @suppress {checkTypes}
 */

function Test1(a: number) {
  return a;
}

function Test2(a: number, b: number) {}

/** @ngInject */
function Test3(a: number, b: number) {}

// Test overloaded functions.
function Test4(a: number): string;
function Test4(a: any): string {
  return 'a';
}

// Test a "this" param and a rest param in the same function.
function TestThisAndRest(this: string, ...params: any[]) {}
TestThisAndRest.call('foo', 'bar', 3);

function Destructuring({a, b}: {a: number, b: number}) {}
function Destructuring2([a, b]: number[], [[c]]: string[][]) {}
function Destructuring3([a, b], [[c]]) {}
Destructuring({a: 1, b: 2});
Destructuring2([1, 2], [['a']]);
Destructuring3([1, 2], [['a']]);

function testRest(...a: number[]) {}
function testRest2(...a: Array<number>) {}
function testRest3(...a) {}
function testRest4<T extends number[]>(...a: T) {}
function testRest5<T extends number[]>(f: (...a: T) => void) {}
function testRest6(...a: [number, number]) {}
function testRest7(...a: any) {}
testRest(1, 2);
testRest2(1, 2);
testRest3(1, 2);
testRest4(1, 2);
testRest5((x: number, y: number) => {});
testRest6(1, 2);
testRest7(1, 'a');

function defaultBeforeRequired(x = 1, y: number, ...z: any[]) {}
defaultBeforeRequired(undefined, 2, 'h', 3);

// The array reference below happens on the template parameter constraint, not
// on the parameter itself. Make sure tsickle unwraps the right type.
function templatedBoundRestArg<T extends string[]>(...str: T) {
  return str.length;
}
// But only do so if the parameter is not an array reference type by itself.
function templatedBoundRestArg2<T extends string>(...str: T[]) {
  return str.length;
}
// Also handle the case where it's both.
function templatedBoundRestArg3<T extends number[]>(...str: T[]) {
  return str.length;
}

function templated<T>(t: T): number {
  return 1;
}
