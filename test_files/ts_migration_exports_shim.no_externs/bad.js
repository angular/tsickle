// test_files/ts_migration_exports_shim.no_externs/bad.ts(35,1): error TS0: at most one call to any of goog.tsMigrationExportsShim, goog.tsMigrationDefaultExportsShim, goog.tsMigrationNamedExportsShim is allowed per file
// test_files/ts_migration_exports_shim.no_externs/bad.ts(62,3): error TS0: goog.tsMigrationExportsShim is only allowed in top level statements
// test_files/ts_migration_exports_shim.no_externs/bad.ts(37,3): error TS0: export must be an exported symbol of the module
// test_files/ts_migration_exports_shim.no_externs/bad.ts(39,3): error TS0: exports object must only contain (shorthand) properties
// test_files/ts_migration_exports_shim.no_externs/bad.ts(43,11): error TS0: export values must be plain identifiers
// test_files/ts_migration_exports_shim.no_externs/bad.ts(45,14): error TS0: export values must be plain identifiers
// test_files/ts_migration_exports_shim.no_externs/bad.ts(49,14): error TS0: export must be an exported symbol of the module
// test_files/ts_migration_exports_shim.no_externs/bad.ts(50,10): error TS0: must be object literal with no keys
// test_files/ts_migration_exports_shim.no_externs/bad.ts(51,23): error TS0: export types must be plain identifiers
// test_files/ts_migration_exports_shim.no_externs/bad.ts(52,28): error TS0: must be a type reference
/**
 *
 * @fileoverview negative tests for the tsMigrationExportsShim transformation.
 *
 * Suppress expected errors for :test_files_compilation_test
 * Generated from: test_files/ts_migration_exports_shim.no_externs/bad.ts
 * @suppress {checkTypes,uselessCode,visibility}
 *
 */
// Allowed to be exported by tsmes.
goog.module('test_files.ts_migration_exports_shim.no_externs.bad');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs/bad.ts' };
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
