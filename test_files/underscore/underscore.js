/**
 *
 * @fileoverview Verify that double-underscored names in various places don't
 * get corrupted. See getIdentifierText() in tsickle.ts.
 * Generated from: test_files/underscore/underscore.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.underscore.underscore');
var module = module || { id: 'test_files/underscore/underscore.ts' };
goog.require('tslib');
const tsickle_export_underscore_1 = goog.requireType("test_files.underscore.export_underscore");
const export_underscore_1 = goog.require('test_files.underscore.export_underscore');
exports.__test = export_underscore_1.__test;
/** @type {number} */
let __foo = 3;
exports.__bar = __foo;
class __Class {
    /**
     * @public
     * @param {string} __arg is __underscored
     * @return {string}
     */
    __method(__arg) {
        return this.__member;
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    __Class.prototype.__member;
}
/**
 * @record
 */
function __Interface() { }
/** @type {{__doubleUnder: (undefined|number)}} */
const doubleUnderscoreInAnonymousType = {};
