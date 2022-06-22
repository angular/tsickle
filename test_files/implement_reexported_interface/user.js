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
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.implement_reexported_interface.user');
var module = module || { id: 'test_files/implement_reexported_interface/user.ts' };
goog.require('tslib');
const tsickle_exporter_1 = goog.requireType("test_files.implement_reexported_interface.exporter");
/**
 * @implements {tsickle_exporter_1.ExportedInterface}
 */
class Test {
    constructor() {
        this.fooStr = 'a';
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    Test.prototype.fooStr;
}
