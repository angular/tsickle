/**
 * @fileoverview An example export to be re-exported.
 * @suppress {visibility} :test_files_compilation_test
 */
declare const notExport = "actually export";
export { notExport as export };
declare global {
    namespace ಠ_ಠ.clutz {
        export { notExport as module$contents$test_files$ts_migration_exports_shim$no_externs$puretransform$declaration$correct_default_value_shorthand_export };
        export namespace module$exports$test_files$ts_migration_exports_shim$no_externs$puretransform$declaration$correct_default_value_shorthand {
            export { notExport as export };
        }
    }
}
