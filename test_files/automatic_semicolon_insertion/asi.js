/**
 * @fileoverview added by tsickle
 * Generated from: test_files/automatic_semicolon_insertion/asi.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.automatic_semicolon_insertion.asi');
var module = module || { id: 'test_files/automatic_semicolon_insertion/asi.ts' };
goog.require('tslib');
/**
 * @return {function(number): number}
 */
function mustParenthesizeCommentedReturnFn() {
    return (/**
     * @param {number} x
     * @return {number}
     */
    (x) => x + 1);
}
exports.mustParenthesizeCommentedReturnFn = mustParenthesizeCommentedReturnFn;
