/**
 *
 * @fileoverview Tests that a re-exported interface can be implemented. This reproduces a bug where
 * tsickle would define re-exports as just "ExportedInterface", not "!ExportedInterface", which
 * would then crash Closure Compiler as it creates a union type, which is unexpected for super
 * interfaces.
 *
 * Generated from: test_files/implement_reexported_interface/user.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.implement_reexported_interface.user');
var module = module || { id: 'test_files/implement_reexported_interface/user.ts' };
module = module;
const tsickle_exporter_1 = goog.requireType("test_files.implement_reexported_interface.exporter");
const tsickle_interface_2 = goog.requireType("test_files.implement_reexported_interface.interface");
/**
 * @implements {tsickle_interface_2.ExportedInterface}
 */
class Test {
    constructor() {
        this.fooStr = 'a';
    }
}
if (false) {
    /** @type {string} */
    Test.prototype.fooStr;
}
