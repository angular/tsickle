/**
 *
 * @fileoverview This test is to verify that an interface that has been
 * extended via declaration merging is still usable as an interface.
 *
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.export_import.test');
var module = module || { id: 'test_files/export_import/test.ts' };
module = module;
exports = {};
// Simple implementation of a type+value.
// We expect an @implements to show in the output.
/**
 * @implements {export_import.IFace}
 */
class C1 {
    constructor() {
        this.a = 'a';
    }
}
if (false) {
    /** @type {string} */
    C1.prototype.a;
}
// Simple implementation of a type+value that is indirected through an
// 'export import' clause.
// We expect an @implements to show in the output.
/**
 * @implements {export_import.IFace}
 */
class C2 {
    constructor() {
        this.a = 'a';
    }
}
if (false) {
    /** @type {string} */
    C2.prototype.a;
}
