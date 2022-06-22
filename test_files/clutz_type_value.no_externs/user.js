/**
 *
 * @fileoverview This test verifies that a type/value-conflict symbol that
 * occurs in a clutz file still can be used in a heritage clause.
 * Generated from: test_files/clutz_type_value.no_externs/user.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.clutz_type_value.no_externs.user');
var module = module || { id: 'test_files/clutz_type_value.no_externs/user.ts' };
goog.require('tslib');
const tsickle_goog_type_value_1 = goog.requireType("type_value");
// We expect IFace to show up in the @implements tag.
/**
 * @implements {tsickle_goog_type_value_1}
 */
class C {
    constructor() {
        this.field = 'abc';
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    C.prototype.field;
}
// We expect IFace to show up in the @type of usingTypeValueConflictType below.
/** @type {(null|!tsickle_goog_type_value_1)} */
const usingTypeValueConflictType = null;
