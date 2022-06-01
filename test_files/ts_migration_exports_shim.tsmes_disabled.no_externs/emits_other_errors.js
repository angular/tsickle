// test_files/ts_migration_exports_shim.tsmes_disabled.no_externs/emits_other_errors.ts(35,1): error TS0: at most one call to any of goog.tsMigrationExportsShim, goog.tsMigrationDefaultExportsShim, goog.tsMigrationNamedExportsShim is allowed per file
// test_files/ts_migration_exports_shim.tsmes_disabled.no_externs/emits_other_errors.ts(62,3): error TS0: goog.tsMigrationExportsShim is only allowed in top level statements
// test_files/ts_migration_exports_shim.tsmes_disabled.no_externs/emits_other_errors.ts(35,1): error TS0: calls to goog.tsMigration*ExportsShim are not enabled. Please set generate_ts_migration_exports_shim = True in the BUILD file to enable this feature.
/**
 *
 * @fileoverview negative tests for the tsMigrationExportsShim transformation.
 *
 * Suppress expected errors for :test_files_compilation_test
 * Generated from: test_files/ts_migration_exports_shim.tsmes_disabled.no_externs/emits_other_errors.ts
 * @suppress {checkTypes,uselessCode,visibility}
 *
 */
// Allowed to be exported by tsmes.
goog.module('test_files.ts_migration_exports_shim.tsmes_disabled.no_externs.emits_other_errors');
var module = module || { id: 'test_files/ts_migration_exports_shim.tsmes_disabled.no_externs/emits_other_errors.ts' };
goog.require('tslib');
/** @type {number} */
exports.exported = 1;
// Allowed to be exported by tsmes.
/** @type {{X: number}} */
exports.nested = {
    // Cannot be exported by tsmes.
    X: 1
};
// Cannot be exported by tsmes.
/** @type {number} */
const notExported = 1;
/**
 * @record
 */
function AnInterface() { }
exports.AnInterface = AnInterface;
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
    AnInterface.prototype.shouldBeANumber;
}
/**
 * @record
 */
function AnInterfaceNotExported() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    AnInterfaceNotExported.prototype.shouldBeAString;
}
/** @typedef {?} */
exports.TemplateType;
/** @type {?} */
const NotAnObjectLiteral = 'bloop';
// Only module-level exports can be exported by tsmes
goog.tsMigrationExportsShim('bad.exports', {
    // This symbol is not exported
    notExported,
    // Method declarations are not module-level exports
    /**
     * @public
     * @return {number}
     */
    method() {
        return 1;
    },
    // Properties are not module-level exports
    nested: { exported: exports.exported },
    // Properties are not module-level exports
    navigated: exports.nested.X,
    // This should be allowed
    foo: (/** @type {!AnInterface} */ ({})),
    // This symbol is not exported
    bar: (/** @type {!AnInterfaceNotExported} */ ({})),
    bloop: (/** @type {!AnInterface} */ (NotAnObjectLiteral)),
    templateType: (/** @type {string} */ ({})),
    objectLiteralType: (/** @type {{someProperty: string}} */ ({}))
});
// Only 0-1 tsmes calls are allowed per-module
goog.tsMigrationExportsShim('only.one.allowed', exports.exported);
/**
 * @return {void}
 */
function f() {
    // tsmes calls must be module-level
    goog.tsMigrationExportsShim('must.be.top.level', {});
}
