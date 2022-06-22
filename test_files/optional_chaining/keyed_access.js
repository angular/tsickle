goog.module('test_files.optional_chaining.keyed_access');
var module = module || { id: 'test_files/optional_chaining/keyed_access.ts' };
goog.require('tslib');
var _a;
/**
 *
 * @fileoverview Tests that tsickle correctly handles casting to the correct
 * type after an optional property access. There was a bug where tsickle's
 * non-nullable assertion transformation would remove type information from a
 * node, which caused TypeScript to crash at a later stage in the compilation.
 * This test contains a minimal reproduction of real code we found that caused
 * that crash.
 * Generated from: test_files/optional_chaining/keyed_access.ts
 * @suppress {checkTypes,uselessCode}
 *
 */
/**
 * @record
 */
function T() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {(undefined|number)}
     * @public
     */
    T.prototype.a;
    /**
     * @type {(undefined|number)}
     * @public
     */
    T.prototype.b;
}
/** @type {!T} */
let t = {};
/** @type {{a: {b: (undefined|{c: (undefined|{d: (undefined|string)})})}}} */
let obj = { a: { b: undefined } };
/** @type {string} */
const key = (_a = obj.a.b) === null || _a === void 0 ? void 0 : _a.c.d;
(/** @type {number} */ (t[key]))++;
