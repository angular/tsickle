/**
 *
 * @fileoverview Tests that a re-exported interface can be implemented. This reproduces a bug where
 * tsickle would define re-exports as just "ExportedInterface", not "!ExportedInterface", which
 * would then crash Closure Compiler as it creates a union type, which is unexpected for super
 * interfaces.
 *
 * @suppress {checkTypes,extraRequire} checked by tsc
 */
goog.module('test_files.implement_reexported_interface.user');
var module = module || { id: 'test_files/implement_reexported_interface/user.ts' };
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.implement_reexported_interface.exporter");
goog.require("test_files.implement_reexported_interface.exporter"); // force type-only module to be loaded
/**
 * @implements {tsickle_forward_declare_1.ExportedInterface}
 */
class Test {
    constructor() {
        this.fooStr = 'a';
    }
}
function Test_tsickle_Closure_declarations() {
    /** @type {string} */
    Test.prototype.fooStr;
}
