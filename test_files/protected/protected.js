/**
 * @fileoverview added by tsickle
 * Generated from: test_files/protected/protected.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** This test checks that we emit \@private/\@protected where necessary. */
goog.module('test_files.protected.protected');
var module = module || { id: 'test_files/protected/protected.ts' };
module = module;
exports = {};
class Protected {
    /**
     * @param {string} anotherPrivate
     * @param {string} anotherProtected
     */
    constructor(anotherPrivate, anotherProtected) {
        this.anotherPrivate = anotherPrivate;
        this.anotherProtected = anotherProtected;
    }
    /**
     * @private
     * @return {void}
     */
    privateMethod() { }
    /**
     * @protected
     * @return {void}
     */
    protectedMethod() { }
}
if (false) {
    /**
     * @type {string}
     * @private
     */
    Protected.prototype.privateMember;
    /**
     * @type {string}
     * @protected
     */
    Protected.prototype.protectedMember;
    /**
     * @type {string}
     * @private
     */
    Protected.prototype.anotherPrivate;
    /**
     * @type {string}
     * @protected
     */
    Protected.prototype.anotherProtected;
}
/**
 * @abstract
 */
class Abstract {
}
if (false) {
    /**
     * @abstract
     * @protected
     * @return {void}
     */
    Abstract.prototype.foo = function () { };
}
