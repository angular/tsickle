goog.module('test_files.import_only_types.types_only');var module = module || {id: 'test_files/import_only_types/types_only.js'};
/**
 * @record
 */
function Foo() { }
exports.Foo = Foo;
/** @type {string} */
Foo.prototype.x;
/** @typedef {number} */
exports.Bar;
