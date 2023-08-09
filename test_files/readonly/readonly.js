/**
 *
 * @fileoverview Tests `readonly` properties are annotated with `\@const`.
 * Generated from: test_files/readonly/readonly.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.readonly.readonly');
var module = module || { id: 'test_files/readonly/readonly.ts' };
goog.require('tslib');
class Class {
    /**
     * @public
     * @param {string} paramProp
     */
    constructor(paramProp) {
        this.paramProp = paramProp;
        this.normalProp = '';
    }
}
exports.Class = Class;
Class.staticProp = '';
/* istanbul ignore if */
if (false) {
    /**
     * @const {string}
     * @public
     */
    Class.staticProp;
    /**
     * @const {string}
     * @public
     */
    Class.prototype.normalProp;
    /**
     * @const {string}
     * @public
     */
    Class.prototype.paramProp;
}
/**
 * @record
 */
function ExportedInterface() { }
exports.ExportedInterface = ExportedInterface;
/* istanbul ignore if */
if (false) {
    /**
     * @const {string}
     * @public
     */
    ExportedInterface.prototype.prop;
    /* Skipping unhandled member: readonly [key: string]: string|undefined;*/
}
/** @typedef {{prop: string}} */
exports.TypeAlias;
// A readonly array is special. It's translated to the `ReadonlyArray`, which
// doesn't have any mutation methods. `Readonly` array is part of the default
// closure externs, see
// https://github.com/google/closure-compiler/blob/f84c81bbfcfb1a3ba8b9fd9e04e514c5aa7f08e1/externs/es3.js#L643
/** @type {!ReadonlyArray<number>} */
exports.readonlyArray = [1, 2, 3];
