/**
 *
 * @fileoverview This test checks that we emit \\@private/\\@protected where
 * necessary.
 * Generated from: test_files/protected/protected.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.protected.protected');
var module = module || { id: 'test_files/protected/protected.ts' };
goog.require('tslib');
class Protected {
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
    /**
     * @public
     * @param {string} anotherPrivate
     * @param {string} anotherProtected
     */
    constructor(anotherPrivate, anotherProtected) {
        this.anotherPrivate = anotherPrivate;
        this.anotherProtected = anotherProtected;
    }
}
/* istanbul ignore if */
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
/* istanbul ignore if */
if (false) {
    /**
     * @abstract
     * @protected
     * @return {void}
     */
    Abstract.prototype.foo = function () { };
}
