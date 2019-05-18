/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.nullable.nullable');
var module = module || { id: 'test_files/nullable/nullable.ts' };
module = module;
exports = {};
class Primitives {
}
if (false) {
    /** @type {(null|string)} */
    Primitives.prototype.nullable;
    /** @type {(undefined|number)} */
    Primitives.prototype.undefinable;
    /** @type {(undefined|null|string)} */
    Primitives.prototype.nullableUndefinable;
    /** @type {(undefined|string)} */
    Primitives.prototype.optional;
}
class NonPrimitive {
}
class NonPrimitives {
}
if (false) {
    /** @type {!NonPrimitive} */
    NonPrimitives.prototype.nonNull;
    /** @type {(null|!NonPrimitive)} */
    NonPrimitives.prototype.nullable;
    /** @type {(undefined|!NonPrimitive)} */
    NonPrimitives.prototype.undefinable;
    /** @type {(undefined|null|!NonPrimitive)} */
    NonPrimitives.prototype.nullableUndefinable;
    /** @type {(undefined|!NonPrimitive)} */
    NonPrimitives.prototype.optional;
}
/**
 * @param {(string|number)} val
 * @return {void}
 */
function takesNonNullable(val) { }
/** @type {{field: (null|string|number)}} */
let x = { field: null };
takesNonNullable((/** @type {(string|number)} */ (x.field)));
takesNonNullable(`${(/** @type {(string|number)} */ (x.field))}`);
/** @type {?} */
let ctx;
takesNonNullable(`org/${(/** @type {?} */ (ctx.getTargetOrganization())).key}/admin/folders`);
