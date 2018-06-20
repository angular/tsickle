/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire} checked by tsc
 */
goog.module('test_files.nonnull_generics.nonnull_generics');
var module = module || { id: 'test_files/nonnull_generics/nonnull_generics.ts' };
/**
 * getOrDefault removes the |null branch from its input. In TypeScript, this works, but in Closure,
 * generics like T are always nullable, and there's no syntax to specify a non-nullable generic.
 * Thus, in Closure, `getOrDefault(maybeNull, 'goodbye')` ends up still being string|null.
 * @template T
 * @param {(null|T)} value
 * @param {T} def
 * @return {T}
 */
function getOrDefault(value, def) {
    return value || def;
}
/**
 * @return {string}
 */
function getMsg() {
    /** @type {(null|string)} */
    const maybeNull = Math.random() > 0.5 ? 'hello' : null;
    // The value below is inferred as string|null, which would normally cause Closure Compiler to
    // complain about an inconsistent nullable return type. However the @suppress {checkTypes}
    // inserted by tsickle at the top will supprress that error.
    return getOrDefault(maybeNull, 'goodbye');
}
console.log(getMsg());
