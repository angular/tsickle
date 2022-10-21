// test_files/decl_merge/rejected_ns.ts(34,1): warning TS0: type/symbol conflict for Inbetween, using {?} for now
// test_files/decl_merge/rejected_ns.ts(9,11): error TS0: transformation of plain namespace not supported. (go/ts-merged-namespaces)
// test_files/decl_merge/rejected_ns.ts(13,11): error TS0: merged declaration must be local class or interface. (go/ts-merged-namespaces)
// test_files/decl_merge/rejected_ns.ts(21,11): error TS0: merged declaration must be local class or interface. (go/ts-merged-namespaces)
// test_files/decl_merge/rejected_ns.ts(26,3): error TS0: const declaration only allowed when merging with an interface (go/ts-merged-namespaces)
// test_files/decl_merge/rejected_ns.ts(38,3): error TS0: non-const values are not supported. (go/ts-merged-namespaces)
// test_files/decl_merge/rejected_ns.ts(40,9): error TS0: 'K' must be exported. (go/ts-merged-namespaces)
// test_files/decl_merge/rejected_ns.ts(42,16): error TS0: Destructuring declarations are not supported. (go/ts-merged-namespaces)
// test_files/decl_merge/rejected_ns.ts(47,11): error TS0: nested namespaces are not supported.  (go/ts-merged-namespaces)
/**
 *
 * @fileoverview Test namespace transformations that are not supported
 *   and result in compiler errors.
 *
 * Generated from: test_files/decl_merge/rejected_ns.ts
 * @suppress {uselessCode,checkTypes}
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
// Adding const values is only allowed on interfaces.
class Cabbage {
}
(function (Cabbage) {
    Cabbage.C = 0;
})(Cabbage || (Cabbage = {}));
/** @type {{a: number, b: string}} */
const o = {
    a: 0,
    b: ''
};
// WARNING: interface has both a type and a value, skipping emit
var Inbetween;
(function (Inbetween) {
    let WHAT_FISH;
    (function (WHAT_FISH) {
        WHAT_FISH[WHAT_FISH["RED_FISH"] = 0] = "RED_FISH";
        WHAT_FISH[WHAT_FISH["BLUE_FISH"] = 1] = "BLUE_FISH";
    })(WHAT_FISH = Inbetween.WHAT_FISH || (Inbetween.WHAT_FISH = {}));
    // Merged values must be const.
    Inbetween.v = 0;
    // Merged const values must be exported.
    /** @type {number} */
    const K = 0;
    // Destructuring declarations are not allowed.
    Inbetween.a = o.a, Inbetween.b = o.b;
})(Inbetween || (Inbetween = {}));
// Nested namespaces are not supported.
class A {
}
