export class ClassOne {}
export class ClassTwo {}
/** @record */
function Interface() {}
 /** @type {number} */
Interface.prototype.x;
export {Interface};

export interface Interface { x: number }
export class ClassWithParams<T> {}

// TODO(evanm):
// export type TypeAlias = number;
// export type TypeAliasWithParam<T> = T[];

export let /** @type {number} */ value = 3;