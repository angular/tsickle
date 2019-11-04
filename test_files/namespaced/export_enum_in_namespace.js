/**
 *
 * @fileoverview tsickle's Closure compatible exported enum emit does not work in namespaces. Bar
 * below must be exported onto foo, which tsickle does by disabling its emit for namespace'd enums.
 *
 * Generated from: test_files/namespaced/export_enum_in_namespace.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// tslint:disable:no-namespace
goog.module('test_files.namespaced.export_enum_in_namespace');
var module = module || { id: 'test_files/namespaced/export_enum_in_namespace.ts' };
module = module;
var foo;
(function (foo) {
    let Bar;
    (function (Bar) {
        Bar[Bar["X"] = 0] = "X";
        Bar[Bar["Y"] = 1] = "Y";
    })(Bar = foo.Bar || (foo.Bar = {}));
    console.log(Bar); // avoid an "unused assignment" error in Closure.
})(foo || (foo = {}));
exports.foo = foo;
