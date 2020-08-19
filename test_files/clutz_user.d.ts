/**
 * @fileoverview Tests that renamed exports get emitted with the correct Clutz
 * alias names.  This is simulating the kinds of references Clutz wants to
 * generate to refer to types in tsickle.
 *
 * This file is tested by the e2e_clutz_dts test and passes as long as it
 * type-checks.
 */

export {};

declare const moduleInternalName: typeof ಠ_ಠ.clutz
    .module$contents$test_files$reexport$declaration$renamed_export_MOTHER;

declare const exportedName: typeof ಠ_ಠ.clutz
    .module$exports$test_files$reexport$declaration$renamed_export.MOTHER;
