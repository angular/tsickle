var fn3 = (a: number): number => 12;
var fn4 = (a) => a + 12;
export var fn5 = (a = 10) => a;

/** @param a this must be escaped, as Closure bails on it. */
const fn6 = (a = 10) => a;
