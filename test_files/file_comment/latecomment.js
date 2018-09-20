// test_files/file_comment/latecomment.ts(3,1): warning TS0: file comments must be at the top of the file, separated from the file body by an empty line.
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
goog.module('test_files.file_comment.latecomment');
var module = module || { id: 'test_files/file_comment/latecomment.ts' };
module = module;
exports = {};
/** @type {number} */
const someVariable = 1;
/** @fileoverview This file overview comment appears after the first statement in the file. */
console.log(someVariable + 2);
