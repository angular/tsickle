/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import { AnnotatorHost } from './annotator_host';
import * as googmodule from './googmodule';
import { ModulesManifest } from './modules_manifest';
import * as tsmes from './ts_migration_exports_shim';
export { pathToModuleName } from './cli_support';
export { getGeneratedExterns } from './externs';
export { FileMap, ModulesManifest } from './modules_manifest';
export interface TsickleHost extends googmodule.GoogModuleProcessorHost, tsmes.TsMigrationExportsShimProcessorHost, AnnotatorHost {
    /**
     * Whether to downlevel decorators
     */
    transformDecorators?: boolean;
    /**
     * Whether to convert types to closure
     */
    transformTypesToClosure?: boolean;
    /** Are tsMigrationExports calls allowed and should shim files be emitted? */
    generateTsMigrationExportsShim?: boolean;
    /**
     * Whether to add aliases to the .d.ts files to add the exports to the
     * ಠ_ಠ.clutz namespace.
     */
    addDtsClutzAliases?: boolean;
    /**
     * If true, tsickle and decorator downlevel processing will be skipped for
     * that file.
     */
    shouldSkipTsickleProcessing(fileName: string): boolean;
    /**
     * Tsickle treats warnings as errors, if true, ignore warnings.  This might be
     * useful for e.g. third party code.
     */
    shouldIgnoreWarningsForPath(filePath: string): boolean;
    /**
     * Whether to convert CommonJS require() imports to goog.module() and
     * goog.require() calls.
     */
    googmodule: boolean;
    /**
     * Whether to add suppressions by default.
     */
    generateExtraSuppressions: boolean;
}
export declare function mergeEmitResults(emitResults: EmitResult[]): EmitResult;
export interface EmitResult extends ts.EmitResult {
    modulesManifest: ModulesManifest;
    /**
     * externs.js files produced by tsickle, if any. module IDs are relative paths
     * from fileNameToModuleId.
     */
    externs: {
        [moduleId: string]: string;
    };
    /**
     * Content for the generated files, keyed by their intended filename.
     * Filenames are google3 relative.
     */
    tsMigrationExportsShimFiles: tsmes.TsMigrationExportsShimFileMap;
}
export interface EmitTransformers {
    /** Custom transformers to evaluate before built-in .js transformations. */
    beforeTs?: ts.CustomTransformers['before'];
    /** Custom transformers to evaluate after built-in .js transformations. */
    afterTs?: ts.CustomTransformers['after'];
    /** Custom transformers to evaluate after built-in .d.ts transformations. */
    afterDeclarations?: ts.CustomTransformers['afterDeclarations'];
}
/**
 * @deprecated Exposed for backward compat with Angular.  Use emit() instead.
 */
export declare function emitWithTsickle(program: ts.Program, host: TsickleHost, tsHost: ts.CompilerHost, tsOptions: ts.CompilerOptions, targetSourceFile?: ts.SourceFile, writeFile?: ts.WriteFileCallback, cancellationToken?: ts.CancellationToken, emitOnlyDtsFiles?: boolean, customTransformers?: EmitTransformers): EmitResult;
export declare function emit(program: ts.Program, host: TsickleHost, writeFile: ts.WriteFileCallback, targetSourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken, emitOnlyDtsFiles?: boolean, customTransformers?: EmitTransformers): EmitResult;
