// test_files/fields/fields.ts(22,5): warning TS0: unhandled anonymous type with constructor signature but no declaration
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.fields.fields');
var module = module || { id: 'test_files/fields/fields.ts' };
module = module;
exports = {};
class FieldsTest {
    /**
     * @param {number} field3
     */
    constructor(field3) {
        this.field3 = field3;
        // A field without an explicit type declaration.
        this.field4 = 'string';
        this.field3 = 2 + 1;
    }
    /**
     * @return {string}
     */
    getF1() {
        // This access prints a warning without a generated field stub declaration.
        return this.field1;
    }
}
if (false) {
    /** @type {string} */
    FieldsTest.prototype.field1;
    /** @type {number} */
    FieldsTest.prototype.field2;
    /** @type {string} */
    FieldsTest.prototype.field4;
    /**
     * @type {number}
     * @private
     */
    FieldsTest.prototype.field3;
}
/** @type {!FieldsTest} */
let fieldsTest = new FieldsTest(3);
// Ensure the type is understood by Closure.
fieldsTest.field1 = 'hi';
/** @type {?} */
let AnonymousClass = class {
};
class BaseThatThrows {
    /**
     * @return {number}
     */
    get throwMe() { throw new Error(); }
}
class Derived extends BaseThatThrows {
}
if (false) {
    /**
     * Note: in Closure, this type is declared via an annotation on
     * Derived.prototype.throwMe, which throws if it's evaluated.
     * So any tsickle output that puts the type declaration at the
     * top level is wrong.
     * @type {number}
     */
    Derived.prototype.throwMe;
}
