/**
 * @fileoverview This test covers the rest parameter of function and method
 * signatures. This includes signatures only consisting of a rest parameter and
 * signatures mixing both explicit declarations and a rest parameter.
 */

interface CallbackMaps {
    // declares all arguments of method signatures
    // as `any` {?}
    [k: string]: ((...args: any) => void);
    // declares the first argument of method
    // signatures as number and all others as `any` {?}
    [k: number]: ((a: number, ...args: any) => void);
}

const p: CallbackMaps = {
    // should annotate a as {?} and b as {?}
    foo(a, b) {
        return [a, b];
    },
    // should annotate a as {number} and b as {?}
    123: (a, b) => ([a, b]),
};

// should annotate a as number and b as {?}
const test: (a: number, ...pats: any) => number = (a, b) => {
    // allowed as b is implicitly declared as `any`
    return a + b;
};
