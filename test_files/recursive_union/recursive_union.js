/**
 *
 * @fileoverview Reproduces a reported crash in tsickle with recursive union
 * types.
 *
 * Generated from: test_files/recursive_union/recursive_union.ts
 */
goog.module('test_files.recursive_union.recursive_union');
var module = module || { id: 'test_files/recursive_union/recursive_union.ts' };
goog.require('tslib');
/**
 * Recursive union type representing valid JSON values.
 * @typedef {(null|string|number|boolean|!Array<(null|string|number|boolean|?|!Object<string,(null|string|number|boolean|?)>)>|!Object<string,(null|string|number|boolean|!Array<(null|string|number|boolean|?)>|?)>)}
 */
exports.JsonValue;
/**
 * A value using the type.
 * @type {(null|string|number|boolean|!Array<(null|string|number|boolean|?|!Object<string,(null|string|number|boolean|?)>)>|!Object<string,(null|string|number|boolean|!Array<(null|string|number|boolean|?)>|?)>)}
 */
exports.validJson = {
    a: 'b',
    c: { d: 'f', g: 8 }
};
