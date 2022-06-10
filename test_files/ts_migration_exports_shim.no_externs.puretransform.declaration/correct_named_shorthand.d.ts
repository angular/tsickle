/**
 * @fileoverview An example export to be re-exported.
 * @suppress {visibility} :test_files_compilation_test
 */
export declare class MyNamedClass {
    field: number;
}
declare const notDelete = "actually delete";
export { notDelete as delete };
declare global {
    namespace ಠ_ಠ.clutz {
        export { MyNamedClass as module$contents$test_files$ts_migration_exports_shim$no_externs$puretransform$declaration$correct_named_shorthand_MyNamedClass, notDelete as module$contents$test_files$ts_migration_exports_shim$no_externs$puretransform$declaration$correct_named_shorthand_delete };
        export namespace module$exports$test_files$ts_migration_exports_shim$no_externs$puretransform$declaration$correct_named_shorthand {
            export { MyNamedClass, notDelete as delete };
        }
    }
}
