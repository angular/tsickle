function Test1(a: number) {
  return a;
}

function Test2(a: number, b: number) {}

/** @ngInject */
function Test3(a: number, b: number) {}

// Test overloaded functions.
function Test4(a: number): string;
function Test4(a: any): string {
  return "a";
}

// Test a "this" param and a rest param in the same function.
function TestThisAndRest(this: string, ...params: any[]) {}
TestThisAndRest.call('foo', 'bar', 3);

function Destructuring({a, b}: {a: number, b: number}) {}
function Destructuring2([a, b]: number[], [[c]]: string[][]) {}
function Destructuring3([a, b], [[c]]) {}
Destructuring({a:1, b:2});
Destructuring2([1, 2], [['a']]);
Destructuring3([1, 2], [['a']]);

function TestSplat(...a: number[]) {}
function TestSplat2(...a: Array<number>) {}
function TestSplat3(...a) {}
TestSplat(1, 2);
TestSplat2(1, 2);
TestSplat3(1, 2);

function defaultBeforeRequired(x = 1, y: number, ...z: any[]) {}
defaultBeforeRequired(undefined, 2, 'h', 3);

function templated<T>(t: T): number {
  return 1;
}
