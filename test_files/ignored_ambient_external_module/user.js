/**
 * @fileoverview Regression test for type-ignored ambient modules.
 * Generated from: test_files/ignored_ambient_external_module/user.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.ignored_ambient_external_module.user');
var module = module || { id: 'test_files/ignored_ambient_external_module/user.ts' };
goog.require('tslib');
class User {
    constructor() { this.field = null; }
}
exports.User = User;
/* istanbul ignore if */
if (false) {
    /** @type {(null|?)} */
    User.prototype.field;
}
