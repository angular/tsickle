/**
 *
 * @fileoverview Tests that a re-exported interface can be implemented.
 *
 * This reproduces a bug where tsickle would define re-exports as just
 * "ExportedInterface", not "!ExportedInterface", which would then crash Closure
 * Compiler as it creates a union type, which is unexpected for super
 * interfaces.
 *
 * Generated from: test_files/implement_reexported_interface/user.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.implement_reexported_interface.user');
var module = module || { id: 'test_files/implement_reexported_interface/user.ts' };
goog.require('tslib');
const tsickle_exporter_1 = goog.requireType("test_files.implement_reexported_interface.exporter");
const tsickle_interface_2 = goog.requireType("test_files.implement_reexported_interface.interface");
// Note: in principle the emit here really ought to only refer to
// the 'exporter' module, but it ends up also referring to the module undereath
// it. This is because for constructing the @implements clause we examine the
// *type* of ExportedInterface and then compute a name for it, and the type is
// resolved through aliases.
/**
 * @implements {tsickle_interface_2.ExportedInterface}
 */
class Test {
    constructor() {
        this.fooStr = 'a';
    }
}
/* istanbul ignore if */
if (COMPILED) {
    /** @type {string} */
    Test.prototype.fooStr;
}
