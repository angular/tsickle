/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import { ModulesManifest } from './modules_manifest';
/**
 * Provides dependencies for and configures the behavior of
 * `importPathToGoogNamespace()` and `commonJsToGoogmoduleTransformer()`.
 */
export interface GoogModuleProcessorHost {
    /**
     * Takes a context (ts.SourceFile.fileName of the current file) and the import
     * URL of an ES6 import and generates a googmodule module name for the
     * imported module.
     */
    pathToModuleName(context: string, importPath: string): string;
    /**
     * If we do googmodule processing, we polyfill module.id, since that's
     * part of ES6 modules.  This function determines what the module.id will be
     * for each file.
     */
    fileNameToModuleId(fileName: string): string;
    /** Identifies whether this file is the result of a JS transpilation. */
    isJsTranspilation?: boolean;
    /**
     * expand "import 'foo';" to "import 'foo/index';" if it points to an index
     * file.
     */
    convertIndexImportShorthand?: boolean;
    /** Is the generated file meant for JSCompiler? */
    transformTypesToClosure?: boolean;
    options: ts.CompilerOptions;
    moduleResolutionHost: ts.ModuleResolutionHost;
}
/**
 * extractModuleMarker extracts the value of a well known marker symbol from the
 * given module symbol. It returns undefined if the symbol wasn't found.
 */
export declare function extractModuleMarker(symbol: ts.Symbol, name: '__clutz_actual_namespace' | '__clutz_multiple_provides' | '__clutz_actual_path' | '__clutz_strip_property' | '__clutz2_actual_path'): string | boolean | undefined;
/**
 * Returns the name of the goog.module, from which the given source file has
 * been generated.
 */
export declare function getOriginalGoogModuleFromComment(sf: ts.SourceFile): string | null;
/**
 * For a given import URL, extracts or finds the namespace to pass to
 * `goog.require` in three special cases:
 *
 * 1) tsickle handles specially encoded URLs starting with `goog:`, e.g. for
 *    `import 'goog:foo.Bar';`, returns `foo.Bar`.
 * 2) source files can contain a special comment, which contains the goog.module
 *    name.
 * 3) ambient modules can contain a special marker symbol
 *    (`__clutz_actual_namespace`) that overrides the namespace to import.
 *
 * This is used to mark imports of Closure JavaScript sources and map them back
 * to the correct goog.require namespace.
 *
 * If the given moduleSymbol is undefined, e.g. because tsickle runs with no
 * type information available, (2) and (3) are disabled, but (1) works.
 *
 * If there's no special cased namespace, namespaceForImportUrl returns null.
 *
 * This is independent of tsickle's regular pathToModuleId conversion logic and
 * happens before it.
 */
export declare function namespaceForImportUrl(context: ts.Node, tsickleDiagnostics: ts.Diagnostic[], tsImport: string, moduleSymbol: ts.Symbol | undefined): string | null;
/**
 * Convert from implicit `import {} from 'pkg'` to a full resolved file name,
 * including any `/index` suffix and also resolving path mappings. TypeScript
 * and many module loaders support the shorthand, but `goog.module` does not, so
 * tsickle needs to resolve the module name shorthand before generating
 * `goog.module` names.
 */
export declare function resolveModuleName({ options, moduleResolutionHost }: {
    options: ts.CompilerOptions;
    moduleResolutionHost: ts.ModuleResolutionHost;
}, pathOfImportingFile: string, imported: string): string;
/**
 * getAmbientModuleSymbol returns the module symbol for the module referenced
 * by the given URL. It special cases ambient module URLs that cannot be
 * resolved (e.g. because they exist on synthesized nodes) and looks those up
 * separately.
 */
export declare function getAmbientModuleSymbol(typeChecker: ts.TypeChecker, moduleUrl: ts.StringLiteral): ts.Symbol | undefined;
/**
 * commonJsToGoogmoduleTransformer returns a transformer factory that converts
 * TypeScript's CommonJS module emit to Closure Compiler compatible goog.module
 * and goog.require statements.
 */
export declare function commonJsToGoogmoduleTransformer(host: GoogModuleProcessorHost, modulesManifest: ModulesManifest, typeChecker: ts.TypeChecker): (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile>;
