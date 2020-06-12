/**
 * @fileoverview Regression test for type-blacklisted ambient modules.
 * Generated from: test_files/blacklisted_ambient_external_module/user.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.blacklisted_ambient_external_module.user');
var module = module || { id: 'test_files/blacklisted_ambient_external_module/user.ts' };
goog.require('tslib');
class User {
    constructor() { this.field = null; }
}
exports.User = User;
if (false) {
    /** @type {(null|?)} */
    User.prototype.field;
}
