// `ambientFn` is ambient because it is in a `.d.ts` file. It has no `declare` keyword though (which
// is legal TS in modules).
// This test makes sure that even if so, types declared within its signature (such as the anonymous
// type of `param`) do get considered ambient for the purpose of emitting externs.
export function ambientFn(param: {key: string}): {value: string};
