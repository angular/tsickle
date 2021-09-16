// test_files/fields/fields.ts(36,5): warning TS0: unhandled anonymous type with constructor signature but no declaration
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/fields/fields.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.fields.fields');
var module = module || { id: 'test_files/fields/fields.ts' };
goog.require('tslib');
class FieldsTest {
    /**
     * @param {number} field3
     */
    constructor(field3) {
        this.field3 = field3;
        // A field without an explicit type declaration.
        this.field4 = 'string';
        /**
         * A field without an explicit type declaration and some JSDoc
         * \@param some description
         */
        this.field5 = stringIdentity;
        this.field1 = '1';
        this.field2 = 2;
        this.field3 = 2 + 1;
        /**
         * \@return an expression statement with some JSDoc
         */
        this.field5;
    }
    /**
     * @return {string}
     */
    getF1() {
        // This access prints a warning without a generated field stub declaration.
        return this.field1;
    }
}
/* istanbul ignore if */
if (false) {
    /** @type {string} */
    FieldsTest.prototype.field1;
    /** @type {number} */
    FieldsTest.prototype.field2;
    /** @type {string} */
    FieldsTest.prototype.field4;
    /**
     * A field without an explicit type declaration and some JSDoc
     * \@param some description
     * @type {function(string): string}
     */
    FieldsTest.prototype.field5;
    /**
     * @type {number}
     * @private
     */
    FieldsTest.prototype.field3;
}
/**
 * @param {string} x
 * @return {string}
 */
function stringIdentity(x) {
    return x;
}
/** @type {!FieldsTest} */
let fieldsTest = new FieldsTest(3);
// Ensure the type is understood by Closure.
fieldsTest.field1 = 'hi';
/** @type {?} */
let AnonymousClass = class {
    constructor() {
        this.field = 1;
    }
};
