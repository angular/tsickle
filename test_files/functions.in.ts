(function() {

function FunctionsTest1(a: number) {
  return a;
}

function FunctionsTest2(a: number, b: number) {}

/** @ngInject */
function FunctionsTest3(a: number, b: number) {}

// Test overloaded functions.
function FunctionsTest4(a: number): string;
function FunctionsTest4(a: any): string {
  return "a";
}

function Destructuring({a, b}: {a: number, b: number}) {}
function Destructuring2([a, b]: number[], [[c]]: string[][]) {}
function Destructuring3([a, b], [[c]]) {}
Destructuring({a:1, b:2});
Destructuring2([1, 2], [['a']]);
Destructuring3([1, 2], [['a']]);

function FunctionsTestsSplat(...a: number[]) {}
function FunctionsTestsSplat2(...a: Array<number>) {}
function FunctionsTestsSplat3(...a) {}
FunctionsTestsSplat(1, 2);
FunctionsTestsSplat2(1, 2);
FunctionsTestsSplat3(1, 2);

})();
