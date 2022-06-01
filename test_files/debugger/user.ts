/**
 * @fileoverview
 * @suppress {checkTypes}
 */

// TODO: the type below should be emitted as `outer.debugger.Foo`. However
// TypeScript does not take the re-export in the outer namespace into account,
// and thus produces not quite the right result.
// See https://github.com/Microsoft/TypeScript/issues/29459

const x: outer.debugger.Foo|null = null;

export {};
