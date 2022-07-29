// test_files/decl_merge/rejected_ns.ts(9,11): error TS0: transformation of plain namespace not supported. (go/ts-merged-namespaces)
// test_files/decl_merge/rejected_ns.ts(13,11): error TS0: merged declaration must be local class or interface. (go/ts-merged-namespaces)
// test_files/decl_merge/rejected_ns.ts(21,11): error TS0: merged declaration must be local class or interface. (go/ts-merged-namespaces)
/**
 *
 * @fileoverview Test namespace transformations that are not supported
 *   and result in compiler errors.
 *
 * Generated from: test_files/decl_merge/rejected_ns.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.decl_merge.rejected_ns');
var module = module || { id: 'test_files/decl_merge/rejected_ns.ts' };
goog.require('tslib');
// Declaration merging with function is not supported.
/**
 * @return {void}
 */
function funcToBeMerged() { }
/** @enum {number} */
const Colors = {
    red: 0,
    green: 1,
    blue: 2,
};
Colors[Colors.red] = 'red';
Colors[Colors.green] = 'green';
Colors[Colors.blue] = 'blue';
