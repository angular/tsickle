// test_files/jsdoc/enum_tag.ts(6,1): warning TS0: @enum annotations are redundant with TypeScript equivalents
// test_files/jsdoc/enum_tag.ts(14,1): warning TS0: @enum annotations are redundant with TypeScript equivalents
// test_files/jsdoc/enum_tag.ts(20,1): warning TS0: @enum annotations are redundant with TypeScript equivalents
// test_files/jsdoc/enum_tag.ts(29,3): warning TS0: @enum annotations are redundant with TypeScript equivalents
// test_files/jsdoc/enum_tag.ts(29,3): warning TS0: @enum annotations are redundant with TypeScript equivalents
/**
 *
 * @fileoverview Checks that JSDoc `\@enum` tags on an `enum` are flagged as
 * warnings.
 *
 * Generated from: test_files/jsdoc/enum_tag.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.jsdoc.enum_tag');
var module = module || { id: 'test_files/jsdoc/enum_tag.ts' };
goog.require('tslib');
/** @enum {number} */
const A = {
    A: 0,
    B: 1,
};
A[A.A] = 'A';
A[A.B] = 'B';
/** @enum {number} */
const B = {
    A: 0,
    B: 1,
};
B[B.A] = 'A';
B[B.B] = 'B';
/** @enum {number} */
const C = {
    A: 10,
    B: 20,
};
C[C.A] = 'A';
C[C.B] = 'B';
class SomeComponent {
    constructor() {
        this.MY_ENUM = {
            A: 10,
            B: 20,
        };
    }
}
/* istanbul ignore if */
if (false) {
    /** @type {{A: number, B: number}} */
    SomeComponent.prototype.MY_ENUM;
}
