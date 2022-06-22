/**
 *
 * @fileoverview Regression test for type-ignored ambient modules.
 * Generated from: test_files/ignored_ambient_external_module/user.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.ignored_ambient_external_module.user');
var module = module || { id: 'test_files/ignored_ambient_external_module/user.ts' };
goog.require('tslib');
class User {
    /**
     * @public
     */
    constructor() {
        this.field = null;
    }
}
exports.User = User;
/* istanbul ignore if */
if (false) {
    /**
     * @type {(null|?)}
     * @public
     */
    User.prototype.field;
}
