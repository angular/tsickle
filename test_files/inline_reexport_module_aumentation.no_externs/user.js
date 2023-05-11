// test_files/inline_reexport_module_aumentation.no_externs/user.ts(6,9): error TS0: [*.proto module] extending a proto through module augmentation is not supported (see go/tsstyle#jspb-import-by-path)
// test_files/inline_reexport_module_aumentation.no_externs/user.ts(8,9): error TS0: [*.proto module] extending a proto through module augmentation is not supported (see go/tsstyle#jspb-import-by-path)
/**
 *
 * @fileoverview Test error message when a user tries to extend a proto by
 * augmenting the module.
 *
 * Generated from: test_files/inline_reexport_module_aumentation.no_externs/user.ts
 */
goog.module('test_files.inline_reexport_module_aumentation.no_externs.user');
var module = module || { id: 'test_files/inline_reexport_module_aumentation.no_externs/user.ts' };
goog.require('tslib');
named_proto_1.FooMsg.prototype.custom = (/**
 * @return {string}
 */
() => {
    return 'Hello world';
});
