import "test_files/import_by_path.declaration.no_externs/clutz_input.d.ts";
import { SomeClass } from 'google3/another/file';
export declare class UsingPathImports {
    someField?: SomeClass;
}
declare global {
    namespace ಠ_ಠ.clutz {
        export { UsingPathImports as module$contents$test_files$import_by_path$declaration$no_externs$decluser_UsingPathImports };
        export namespace module$exports$test_files$import_by_path$declaration$no_externs$decluser {
            export { UsingPathImports };
        }
    }
}
