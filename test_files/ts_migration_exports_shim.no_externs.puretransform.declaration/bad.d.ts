/**
 * @fileoverview negative tests for the tsMigrationExportsShim transformation.
 *
 * Suppress expected errors for :test_files_compilation_test
 * @suppress {checkTypes,undefinedNames,visibility}
 */
export declare const exported = 1;
export declare const nested: {
    X: number;
};
declare global {
    namespace ಠ_ಠ.clutz {
        export { exported as module$contents$test_files$ts_migration_exports_shim$no_externs$puretransform$declaration$bad_exported, nested as module$contents$test_files$ts_migration_exports_shim$no_externs$puretransform$declaration$bad_nested };
        export namespace module$exports$test_files$ts_migration_exports_shim$no_externs$puretransform$declaration$bad {
            export { exported, nested };
        }
    }
}
