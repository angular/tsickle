/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * AnnotatorHost contains host properties for the JSDoc-annotation process.
 * It's used by a bunch of different tsickle modules, including the type
 * translators, the externs generator, and the main JSDoc transformer.
 *
 * Contrast this with the GoogModuleProcessorHost, the separate host used for
 * the goog.module() translation process.
 *
 * TODO(evmar): consider breaking this into more scoped hosts for the different
 * modules, rather than one massive list of all possible needed functionality.
 */
export interface AnnotatorHost {
  /**
   * If provided a function that logs an internal warning.
   * These warnings are not actionable by an end user and should be hidden
   * by default.
   */
  logWarning?: (warning: ts.Diagnostic) => void;
  pathToModuleName: (context: string, importPath: string) => string;
  /**
   * If true, convert every type to the Closure {?} type, which means
   * "don't check types".
   */
  untyped?: boolean;
  /** If provided, a set of paths whose types should always generate as {?}. */
  typeBlackListPaths?: Set<string>;
  /**
   * Convert shorthand "/index" imports to full path (include the "/index").
   * Annotation will be slower because every import must be resolved.
   */
  convertIndexImportShorthand?: boolean;
  /**
   * If true, modify quotes around property accessors to match the type declaration.
   */
  enableAutoQuoting?: boolean;
  /**
   * Whether tsickle should insert goog.provide() calls into the externs generated for `.d.ts` files
   * that are external modules.
   */
  provideExternalModuleDtsNamespace?: boolean;

  /** host allows resolving file names to modules. */
  host: ts.ModuleResolutionHost;
  /** Used together with the host for file name -> module name resolution. */
  options: ts.CompilerOptions;
}
