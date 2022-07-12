/**
 * @fileoverview
 * @suppress {untranspilableFeatures} ES2018 feature "RegExp named groups"
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import { ModulesManifest } from './modules_manifest';
/** Provides dependencies for file generation. */
export interface TsMigrationExportsShimProcessorHost {
    /** Are tsMigrationExports calls allowed and should shim files be emitted? */
    generateTsMigrationExportsShim?: boolean;
    /** If true emit .legacy.closure.js file, else emit .legacy.d.ts */
    transformTypesToClosure?: boolean;
    /** See compiler_host.ts */
    pathToModuleName(context: string, importPath: string): string;
    /** See compiler_host.ts */
    rootDirsRelative(fileName: string): string;
}
/**
 * A map from google3 relative paths to shim file content.
 */
export declare type TsMigrationExportsShimFileMap = Map<string, string>;
/**
 * Creates a transformer that eliminates goog.tsMigration*ExportsShim (tsmes)
 * statements and generates appropriate shim file content. If requested in the
 * TypeScript compiler options, it will also produce a `.d.ts` file.
 *
 * Files are stored in outputFileMap, the caller must make sure to emit them.
 *
 * This transformation will always report an error if
 * `generateTsMigrationExportsShim` is false.
 */
export declare function createTsMigrationExportsShimTransformerFactory(typeChecker: ts.TypeChecker, host: TsMigrationExportsShimProcessorHost, manifest: ModulesManifest, tsickleDiagnostics: ts.Diagnostic[], outputFileMap: TsMigrationExportsShimFileMap): ts.TransformerFactory<ts.SourceFile>;
