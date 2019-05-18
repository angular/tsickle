export {};

var v1: string;
var v2: string, v3: number;

// Tests that tsickle emits a precise type for the inferred anonymous type of `inferred`.

const inferred = {a: 1, b: [{c: '2'}]};

export const v4 = 1;
export let v5: string, v6 = 1;

let v7 = 1, v8 = 1;

// Closure Compiler has no syntax for destructuring patterns, so these are emitted without a type
// annotation.

const [destructured1, destructured2]: string[] = ['destructured1', 'destructured2'];
const {destructured3, destructured4}: {destructured3: number, destructured4: number} = {
  destructured3: 3,
  destructured4: 4
};
