goog.module('test_files.private_field.private_field');
var module = module || { id: 'test_files/private_field/private_field.ts' };
var _ContainsPrivateField_someField;
const tslib_1 = goog.require('tslib');
/**
 *
 * @fileoverview Tests the generation of private field accessors from Tsickle. They do not generate
 * any externs, as they do not exist on the class themselves when downleveled by TypeScript.
 *
 * Generated from: test_files/private_field/private_field.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class ContainsPrivateField {
    /**
     * @param {string} arg
     */
    constructor(arg) {
        _ContainsPrivateField_someField.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _ContainsPrivateField_someField, arg, "f");
    }
    /**
     * @param {string} value
     * @return {void}
     */
    setSomeField(value) {
        tslib_1.__classPrivateFieldSet(this, _ContainsPrivateField_someField, value, "f");
    }
    /**
     * @return {string}
     */
    getSomeField() {
        return tslib_1.__classPrivateFieldGet(this, _ContainsPrivateField_someField, "f");
    }
}
_ContainsPrivateField_someField = new WeakMap();
/* istanbul ignore if */
if (false) {
    /* Skipping private member:
    #someField: string;*/
}
