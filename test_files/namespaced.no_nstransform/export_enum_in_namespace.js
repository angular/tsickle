/**
 *
 * @fileoverview tsickle's Closure compatible exported enum emit does not work in namespaces. Bar
 * below must be exported onto foo, which tsickle does by disabling its emit for namespace'd enums.
 *
 * Generated from: test_files/namespaced.no_nstransform/export_enum_in_namespace.ts
 */
// tslint:disable:no-namespace
goog.module('test_files.namespaced.no_nstransform.export_enum_in_namespace');
var module = module || { id: 'test_files/namespaced.no_nstransform/export_enum_in_namespace.ts' };
goog.require('tslib');
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
