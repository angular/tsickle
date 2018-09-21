// All of the types/values declared in this file should
// 1) generate externs
// 2) generate an export
// 3) be usable within the file
//
// TODO(https://github.com/angular/tsickle/issues/352):
// For types, we have the additional requirement that the externs name
// should be namespaced into a private namespace.
// E.g. "export declare interface Error" should not conflict with the
// Closure builtin Error type.

let user1: ExportDeclaredIf;
export declare interface ExportDeclaredIf { x: number; }
export declare const exportedDeclaredVar: number;
export declare class ExportDeclaredClass { x: number; }
let user3: ExportDeclaredClass;
export declare const multiExportedDeclaredVar1: string, multiExportedDeclaredVar2: number;
export declare type ExportDeclaredType = string;
let user6: ExportDeclaredType;
export declare function exportedDeclaredFn(): ExportDeclaredIf;

declare namespace exported.namespace {
   class ExportedClassInNamespace {}
}

const fromClassInNamespace = new exported.namespace.ExportedClassInNamespace();
export declare enum ExportDeclaredEnum { VALUE = 1 };
