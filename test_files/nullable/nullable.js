goog.module('test_files.nullable.nullable');var module = module || {id: 'test_files/nullable/nullable.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class Primitives {
}
function Primitives_tsickle_Closure_declarations() {
    /** @type {(string|null)} */
    Primitives.prototype.nullable;
    /** @type {(number|undefined)} */
    Primitives.prototype.undefinable;
    /** @type {(string|null|undefined)} */
    Primitives.prototype.nullableUndefinable;
    /** @type {(undefined|string)} */
    Primitives.prototype.optional;
}
class NonPrimitive {
}
class NonPrimitives {
}
function NonPrimitives_tsickle_Closure_declarations() {
    /** @type {!NonPrimitive} */
    NonPrimitives.prototype.nonNull;
    /** @type {(!NonPrimitive|null)} */
    NonPrimitives.prototype.nullable;
    /** @type {(!NonPrimitive|undefined)} */
    NonPrimitives.prototype.undefinable;
    /** @type {(!NonPrimitive|null|undefined)} */
    NonPrimitives.prototype.nullableUndefinable;
    /** @type {(undefined|!NonPrimitive)} */
    NonPrimitives.prototype.optional;
}
/**
 * @param {(string|number)} val
 * @return {void}
 */
function takesNonNullable(val) { }
let /** @type {{field: (null|string|number)}} */ x = { field: null };
takesNonNullable(/** @type {(string|number)} */ ((x.field)));
takesNonNullable(`${(/** @type {(string|number)} */ ((x.field)))}`);
let /** @type {?} */ ctx;
takesNonNullable(`org/${(/** @type {?} */ ((ctx.getTargetOrganization()))).key}/admin/folders`);
