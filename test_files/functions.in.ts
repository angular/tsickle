function FunctionsTest1(a: any): string;
function FunctionsTest1(a: number): string {
  return "a";
}
function FunctionsTest2(a: number, b: number) {}
/** @ngInject */
function FunctionsTest3(a: number, b: number) {}
function Destructuring({a, b}: {a: number, b: number}) {}

function FunctionsTestsSplat(...a: number[]) {}
function FunctionsTestsSplat2(...a: Array<number>) {}
function FunctionsTestsSplat3(...a) {}
FunctionsTestsSplat(1, 2);
FunctionsTestsSplat2(1, 2);
FunctionsTestsSplat3(1, 2);
