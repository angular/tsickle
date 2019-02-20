/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AnnotatorHost} from './annotator_host';
import {assertAbsolute} from './cli_support';
import {decoratorDownlevelTransformer} from './decorator_downlevel_transformer';
import {enumTransformer} from './enum_transformer';
import {generateExterns} from './externs';
import {transformFileoverviewCommentFactory} from './fileoverview_comment_transformer';
import * as googmodule from './googmodule';
import {jsdocTransformer, removeTypeAssertions} from './jsdoc_transformer';
import {ModulesManifest} from './modules_manifest';
import {quotingTransformer} from './quoting_transformer';
import {isDtsFileName} from './transformer_util';

// Retained here for API compatibility.
export {getGeneratedExterns} from './externs';
export {FileMap, ModulesManifest} from './modules_manifest';

export interface TsickleHost extends googmodule.GoogModuleProcessorHost, AnnotatorHost {
  /**
   * Whether to downlevel decorators
   */
  transformDecorators?: boolean;
  /**
   * Whether to convers types to closure
   */
  transformTypesToClosure?: boolean;
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
  /** Whether to convert CommonJS require() imports to goog.module() and goog.require() calls. */
  googmodule: boolean;
}

export function mergeEmitResults(emitResults: EmitResult[]): EmitResult {
  const diagnostics: ts.Diagnostic[] = [];
  let emitSkipped = true;
  const emittedFiles: string[] = [];
  const externs: {[fileName: string]: string} = {};
  const modulesManifest = new ModulesManifest();
  for (const er of emitResults) {
    diagnostics.push(...er.diagnostics);
    emitSkipped = emitSkipped || er.emitSkipped;
    if (er.emittedFiles) {
      emittedFiles.push(...er.emittedFiles);
    }
    Object.assign(externs, er.externs);
    modulesManifest.addManifest(er.modulesManifest);
  }
  return {diagnostics, emitSkipped, emittedFiles, externs, modulesManifest};
}

export interface EmitResult extends ts.EmitResult {
  // The manifest of JS modules output by the compiler.
  modulesManifest: ModulesManifest;
  /**
   * externs.js files produced by tsickle, if any. module IDs are relative paths from
   * fileNameToModuleId.
   */
  externs: {[moduleId: string]: string};
}

export interface EmitTransformers {
  /** Custom transformers to evaluate before Tsickle .js transformations. */
  beforeTsickle?: Array<ts.TransformerFactory<ts.SourceFile>>;
  /** Custom transformers to evaluate before built-in .js transformations. */
  beforeTs?: Array<ts.TransformerFactory<ts.SourceFile>>;
  /** Custom transformers to evaluate after built-in .js transformations. */
  afterTs?: Array<ts.TransformerFactory<ts.SourceFile>>;
  /** Custom transformers to evaluate after built-in .d.ts transformations. */
  afterDeclarations?: Array<ts.TransformerFactory<ts.Bundle|ts.SourceFile>>;
}

export function emitWithTsickle(
    program: ts.Program, host: TsickleHost, tsHost: ts.CompilerHost, tsOptions: ts.CompilerOptions,
    targetSourceFile?: ts.SourceFile, writeFile?: ts.WriteFileCallback,
    cancellationToken?: ts.CancellationToken, emitOnlyDtsFiles?: boolean,
    customTransformers: EmitTransformers = {}): EmitResult {
  for (const sf of program.getSourceFiles()) {
    assertAbsolute(sf.fileName);
  }

  let tsickleDiagnostics: ts.Diagnostic[] = [];
  const typeChecker = program.getTypeChecker();
  const tsickleSourceTransformers: Array<ts.TransformerFactory<ts.SourceFile>> = [];
  if (host.transformTypesToClosure) {
    // Only add @suppress {checkTypes} comments when also adding type annotations.
    tsickleSourceTransformers.push(transformFileoverviewCommentFactory(tsickleDiagnostics));
    tsickleSourceTransformers.push(
        jsdocTransformer(host, tsOptions, tsHost, typeChecker, tsickleDiagnostics));
    if (host.enableAutoQuoting) {
      tsickleSourceTransformers.push(quotingTransformer(host, typeChecker, tsickleDiagnostics));
    }
    tsickleSourceTransformers.push(enumTransformer(typeChecker, tsickleDiagnostics));
    tsickleSourceTransformers.push(decoratorDownlevelTransformer(typeChecker, tsickleDiagnostics));
  } else if (host.transformDecorators) {
    tsickleSourceTransformers.push(decoratorDownlevelTransformer(typeChecker, tsickleDiagnostics));
  }
  const modulesManifest = new ModulesManifest();
  const tsickleTransformers: ts.CustomTransformers = {before: tsickleSourceTransformers};
  const tsTransformers: ts.CustomTransformers = {
    before: [
      ...(customTransformers.beforeTsickle || []),
      ...(tsickleTransformers.before || []).map(tf => skipTransformForSourceFileIfNeeded(host, tf)),
      ...(customTransformers.beforeTs || []),
    ],
    after: [
      ...(customTransformers.afterTs || []),
      ...(tsickleTransformers.after || []).map(tf => skipTransformForSourceFileIfNeeded(host, tf)),
    ],
    afterDeclarations: customTransformers.afterDeclarations,
  };
  if (host.transformTypesToClosure) {
    // See comment on remoteTypeAssertions.
    tsTransformers.before!.push(removeTypeAssertions());
  }
  if (host.googmodule) {
    tsTransformers.after!.push(googmodule.commonJsToGoogmoduleTransformer(
        host, modulesManifest, typeChecker, tsickleDiagnostics));
  }

  const writeFileDelegate: ts.WriteFileCallback = writeFile || tsHost.writeFile.bind(tsHost);
  const writeFileImpl: ts.WriteFileCallback =
      (fileName, content, writeByteOrderMark, onError, sourceFiles) => {
        assertAbsolute(fileName);
        if (host.addDtsClutzAliases && isDtsFileName(fileName) && sourceFiles) {
          // Only bundle emits pass more than one source file for .d.ts writes. Bundle emits however
          // are not supported by tsickle, as we cannot annotate them for Closure in any meaningful
          // way anyway.
          if (!sourceFiles || sourceFiles.length > 1) {
            throw new Error(`expected exactly one source file for .d.ts emit, got ${
                sourceFiles.map(sf => sf.fileName)}`);
          }
          const originalSource = sourceFiles[0];
          content = addClutzAliases(content, originalSource, typeChecker, host);
        }
        writeFileDelegate(fileName, content, writeByteOrderMark, onError, sourceFiles);
      };

  const {diagnostics: tsDiagnostics, emitSkipped, emittedFiles} = program.emit(
      targetSourceFile, writeFileImpl, cancellationToken, emitOnlyDtsFiles, tsTransformers);

  const externs: {[fileName: string]: string} = {};
  if (host.transformTypesToClosure) {
    const sourceFiles = targetSourceFile ? [targetSourceFile] : program.getSourceFiles();
    for (const sourceFile of sourceFiles) {
      const isDts = isDtsFileName(sourceFile.fileName);
      if (isDts && host.shouldSkipTsickleProcessing(sourceFile.fileName)) {
        continue;
      }
      const {output, diagnostics} =
          generateExterns(typeChecker, sourceFile, host, host.moduleResolutionHost, tsOptions);
      if (output) {
        externs[sourceFile.fileName] = output;
      }
      if (diagnostics) {
        tsickleDiagnostics.push(...diagnostics);
      }
    }
  }
  // All diagnostics (including warnings) are treated as errors.
  // If the host decides to ignore warnings, just discard them.
  // Warnings include stuff like "don't use @type in your jsdoc"; tsickle
  // warns and then fixes up the code to be Closure-compatible anyway.
  tsickleDiagnostics = tsickleDiagnostics.filter(
      d => d.category === ts.DiagnosticCategory.Error ||
          !host.shouldIgnoreWarningsForPath(d.file!.fileName));

  return {
    modulesManifest,
    emitSkipped,
    emittedFiles: emittedFiles || [],
    diagnostics: [...tsDiagnostics, ...tsickleDiagnostics],
    externs
  };
}

/** Compares two strings and returns a number suitable for use in sort(). */
function stringCompare(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * A tsickle produced declaration file might be consumed be referenced by Clutz
 * produced .d.ts files, which use symbol names based on Closure's internal
 * naming conventions, so we need to provide aliases for all the exported symbols
 * in the Clutz naming convention.
 */
function addClutzAliases(
    dtsFileContent: string, sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker,
    host: TsickleHost): string {
  const moduleSymbol = typeChecker.getSymbolAtLocation(sourceFile);
  const moduleExports = moduleSymbol && typeChecker.getExportsOfModule(moduleSymbol);
  if (!moduleExports) return dtsFileContent;

  // .d.ts files can be transformed, too, so we need to compare the original node below.
  const origSourceFile = ts.getOriginalNode(sourceFile);
  // In order to write aliases, the exported symbols need to be available in the
  // the module scope. That is not always the case:
  //
  // export
  // 1) export const X;           // works
  //
  // reexport
  // 2) export {X} from './foo';  // doesn't
  //
  // imported reexport
  // 3) import {X} from './foo';  // works
  //    export {X} from './foo';
  //
  // getExportsOfModule returns all three types, but we need to separate 2).
  // For now we 'fix' 2) by simply not emitting a clutz alias, since clutz
  // interop is used in minority of scenarios.
  //
  // TODO(radokirov): attempt to add appropriate imports for 2) so that
  // currently finding out local appears even harder than fixing exports.
  const localExports = moduleExports.filter(e => {
    // If there are no declarations, be conservative and don't emit the aliases.
    // I don't know how can this happen, we have no tests that excercise it.
    if (!e.declarations) return false;

    // Skip default exports, they are not currently supported.
    // default is a keyword in typescript, so the name of the export being
    // default means that it's a default export.
    if (e.name === 'default') return false;

    // Use the declaration location to determine separate cases above.
    for (const d of e.declarations) {
      // This is a special case for export *. Technically, it is outside the
      // three cases outlined, but at this point we have rewritten it to a
      // reexport or an imported reexport. However, it appears that the
      // rewriting also has made it behave different from explicit named export
      // in the sense that the declaration appears to point at the original
      // location not the reexport location.  Since we can't figure out whether
      // there is a local import here, we err on the side of less emit.
      if (d.getSourceFile() !== origSourceFile) {
        return false;
      }

      if (!ts.isExportSpecifier(d)) {
        // we have a pure export (case 1) thus safe to emit clutz alias.
        return true;
      }

      // The declaration d is useless to separate reexport and import-reexport
      // because they both point to the reexporting file and not to the original
      // one.  However, there is another ts API that can do a deeper resolution.
      const localSymbol = typeChecker.getExportSpecifierLocalTargetSymbol(d);
      // I don't know how can this happen, but err on the side of less emit.
      if (!localSymbol) return false;

      // In case of no import we ended up in a declaration in foo.ts, while in
      // case of having an import localD is still in the reexporing file.
      for (const localD of localSymbol.declarations) {
        if (localD.getSourceFile() !== origSourceFile) {
          return false;
        }
      }
    }
    return true;
  });
  if (!localExports.length) return dtsFileContent;

  // TypeScript 2.8 and TypeScript 2.9 differ on the order in which the
  // module symbols come out, so sort here to make the tests stable.
  localExports.sort((a, b) => stringCompare(a.name, b.name));

  const moduleName = host.pathToModuleName('', sourceFile.fileName);
  const clutzModuleName = moduleName.replace(/\./g, '$');

  // Clutz might refer to the name in two different forms (stemming from goog.provide and
  // goog.module respectively).
  // 1) global in clutz:   ಠ_ಠ.clutz.module$contents$path$to$module_Symbol...
  // 2) local in a module: ಠ_ಠ.clutz.module$exports$path$to$module.Symbol ..
  // See examples at:
  // https://github.com/angular/clutz/tree/master/src/test/java/com/google/javascript/clutz

  // Case (1) from above.
  let globalSymbols = '';
  // Case (2) from above.
  let nestedSymbols = '';
  for (const symbol of localExports) {
    let localName = symbol.name;
    const declaration = symbol.declarations.find(d => d.getSourceFile() === origSourceFile);
    if (declaration && ts.isExportSpecifier(declaration) && declaration.propertyName) {
      // If declared in an "export {X as Y};" export specifier, then X (stored in propertyName) is
      // the local name that resolves within the module, whereas Y is only available on the exports,
      // i.e. the name used to address the symbol from outside the module.
      // Use the localName for the export then, but publish under the external name.
      localName = declaration.propertyName.text;
    }
    globalSymbols +=
        `\t\texport {${localName} as module$contents$${clutzModuleName}_${symbol.name}}\n`;
    nestedSymbols +=
        `\t\texport {module$contents$${clutzModuleName}_${symbol.name} as ${symbol.name}}\n`;
  }

  dtsFileContent += 'declare global {\n';
  dtsFileContent += `\tnamespace ಠ_ಠ.clutz {\n`;
  dtsFileContent += globalSymbols;
  dtsFileContent += `\t}\n`;
  dtsFileContent += `\tnamespace ಠ_ಠ.clutz.module$exports$${clutzModuleName} {\n`;
  dtsFileContent += nestedSymbols;
  dtsFileContent += `\t}\n`;
  dtsFileContent += '}\n';

  return dtsFileContent;
}

function skipTransformForSourceFileIfNeeded(
    host: TsickleHost,
    delegateFactory: ts.TransformerFactory<ts.SourceFile>): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    const delegate = delegateFactory(context);
    return (sourceFile: ts.SourceFile) => {
      if (host.shouldSkipTsickleProcessing(sourceFile.fileName)) {
        return sourceFile;
      }
      return delegate(sourceFile);
    };
  };
}
