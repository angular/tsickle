/**
 * A function type that includes a generic type argument. Unsupported by
 * Closure, so tsickle should emit ?.
 */
let genericFnType: <T>(t: T) => T = (x) => x;

let genericCtorFnType: new<T>(t: T) => T;
