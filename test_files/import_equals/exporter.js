goog.module('test_files.import_equals.exporter');

exports.Exported = class {};
exports.Exported.Nested = class {};
/** @enum {number} */
exports.Exported.Nested.Thing = {
  ITEM: 1
};
