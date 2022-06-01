/**
 *
 * @fileoverview
 * Generated from: test_files/nullable/nullable.ts
 * @suppress {checkTypes,uselessCode}
 *
 */
goog.module('test_files.nullable.nullable');
var module = module || { id: 'test_files/nullable/nullable.ts' };
goog.require('tslib');
class Primitives {
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {(null|string)}
     * @public
     */
    Primitives.prototype.nullable;
    /**
     * @type {(undefined|number)}
     * @public
     */
    Primitives.prototype.undefinable;
    /**
     * @type {(undefined|null|string)}
     * @public
     */
    Primitives.prototype.nullableUndefinable;
    /**
     * @type {(undefined|string)}
     * @public
     */
    Primitives.prototype.optional;
}
class NonPrimitive {
}
class NonPrimitives {
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {!NonPrimitive}
     * @public
     */
    NonPrimitives.prototype.nonNull;
    /**
     * @type {(null|!NonPrimitive)}
     * @public
     */
    NonPrimitives.prototype.nullable;
    /**
     * @type {(undefined|!NonPrimitive)}
     * @public
     */
    NonPrimitives.prototype.undefinable;
    /**
     * @type {(undefined|null|!NonPrimitive)}
     * @public
     */
    NonPrimitives.prototype.nullableUndefinable;
    /**
     * @type {(undefined|!NonPrimitive)}
     * @public
     */
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
