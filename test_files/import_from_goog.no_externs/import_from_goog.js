/**
 *
 * @fileoverview
 *
 * Generated from: test_files/import_from_goog.no_externs/import_from_goog.ts
 */
goog.module('test_files.import_from_goog.no_externs.import_from_goog');
var module = module || { id: 'test_files/import_from_goog.no_externs/import_from_goog.ts' };
goog.require('tslib');
const tsickle_Module_1 = goog.requireType("closure.Module");
const tsickle_OtherModule_2 = goog.requireType("closure.OtherModule");
const tsickle_LegacyModule_3 = goog.requireType("closure.LegacyModule");
const tsickle_TransitiveType_4 = goog.requireType("closure.TransitiveType");
const goog_closure_Module_1 = goog.require('closure.Module');
// Make sure that default imports from goog: modules are emitted as just the
// module symbol, without a ".default" property.
// tslint:disable-next-line:no-inferrable-new-expression
/** @type {!tsickle_Module_1} */
const x = new goog_closure_Module_1();
/** @type {!tsickle_OtherModule_2.SymA} */
let y;
/** @type {!tsickle_LegacyModule_3.LegacyExport} */
let z;
/**
 * @param {!tsickle_LegacyModule_3.LegacyExport} legacyExport
 * @return {!tsickle_TransitiveType_4}
 */
function f(legacyExport) {
    return legacyExport.property;
}
