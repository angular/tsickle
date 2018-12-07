/**
 * @fileoverview Regression test for type-blacklisted ambient modules.
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.blacklisted_ambient_external_module.user');
var module = module || { id: 'test_files/blacklisted_ambient_external_module/user.ts' };
module = module;
exports = {};
class User {
    constructor() { this.field = null; }
}
exports.User = User;
if (false) {
    /** @type {(null|?)} */
    User.prototype.field;
}
