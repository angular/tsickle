/**
 *
 * @fileoverview
 * Generated from: test_files/doc_params/doc_params.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.doc_params.doc_params');
var module = module || { id: 'test_files/doc_params/doc_params.ts' };
goog.require('tslib');
class Foo {
    /**
     * @ngInject
     * @public
     * @param {string} a
     */
    // Some comment
    constructor(a) {
        this.a = a;
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @private
     */
    Foo.prototype.a;
}
