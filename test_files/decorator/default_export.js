/**
 * @fileoverview Tests using a default imported class for in a decorated ctor.
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.decorator.default_export');
var module = module || { id: 'test_files/decorator/default_export.ts' };
module = module;
exports = {};
// tslint:disable-next-line:no-default-export
class DefaultExport {
}
exports.default = DefaultExport;
if (false) {
    /** @type {string} */
    DefaultExport.prototype.field;
}
