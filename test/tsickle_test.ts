/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {expect} from 'chai';
import * as path from 'path';
import * as ts from 'typescript';

import * as tsickle from '../src/tsickle';
import * as testSupport from './test_support';

describe('emitWithTsickle', () => {
  function emitWithTsickle(
      tsSources: {[fileName: string]: string}, tsConfigOverride: Partial<ts.CompilerOptions> = {},
      tsickleHostOverride: Partial<tsickle.TsickleHost> = {},
      customTransformers?: tsickle.EmitTransformers): {[fileName: string]: string} {
    const tsCompilerOptions:
        ts.CompilerOptions = {...testSupport.compilerOptions, ...tsConfigOverride};
    const tsSourcesMap = objectToMap(tsSources);

    const {program, host: tsHost} =
        testSupport.createProgramAndHost(tsSourcesMap, tsCompilerOptions);
    const diagnostics = program.getSemanticDiagnostics();
    if (diagnostics.length) {
      throw new Error(tsickle.formatDiagnostics(diagnostics));
    }
    const tsickleHost: tsickle.TsickleHost = {
      es5Mode: true,
      googmodule: false,
      convertIndexImportShorthand: true,
      transformDecorators: true,
      transformTypesToClosure: true,
      untyped: true,
      logWarning: (diag: ts.Diagnostic) => {},
      shouldSkipTsickleProcessing: (fileName) => !tsSourcesMap.has(fileName),
      shouldIgnoreWarningsForPath: () => false,
      pathToModuleName: (context, importPath) => {
        importPath = importPath.replace(/(\.d)?\.[tj]s$/, '');
        if (importPath[0] === '.') importPath = path.join(path.dirname(context), importPath);
        return importPath.replace(/\/|\\/g, '.');
      },
      fileNameToModuleId: (fileName) => fileName.replace(/^\.\//, ''),
      ...tsickleHostOverride
    };
    const jsSources: {[fileName: string]: string} = {};
    tsickle.emitWithTsickle(
        program, tsickleHost, tsHost, tsCompilerOptions, /* sourceFile */ undefined,
        (fileName: string, data: string) => jsSources[fileName] = data,
        /* cancellationToken */ undefined, /* emitOnlyDtsFiles */ undefined, customTransformers);
    return jsSources;
  }


  it('should run custom transformers for files with skipTsickleProcessing', () => {
    function transformValue(context: ts.TransformationContext) {
      return (sourceFile: ts.SourceFile): ts.SourceFile => {
        return visitNode(sourceFile) as ts.SourceFile;

        function visitNode(node: ts.Node): ts.Node {
          if (node.kind === ts.SyntaxKind.NumericLiteral) {
            return ts.createLiteral(2);
          }
          return ts.visitEachChild(node, visitNode, context);
        }
      };
    }

    const tsSources = {
      'a.ts': `export const x = 1;`,
    };
    const jsSources = emitWithTsickle(
        tsSources, undefined, {
          shouldSkipTsickleProcessing: () => true,
        },
        {beforeTs: [transformValue]});

    expect(jsSources['./a.js']).to.contain('exports.x = 2;');
  });


  describe('regressions', () => {
    it('should produce correct .d.ts files when expanding `export *` with es2015 module syntax',
       () => {
         const tsSources = {'a.ts': `export const x = 1;`, 'b.ts': `export * from './a';\n`};
         const jsSources = emitWithTsickle(
             tsSources, {
               declaration: true,
               module: ts.ModuleKind.ES2015,
             },
             {es5Mode: false, googmodule: false});

         expect(jsSources['./b.d.ts']).to.eq(`export * from './a';\n`);
       });

  });
});

function objectToMap(data: {[key: string]: string}): Map<string, string> {
  const entries = Object.keys(data).map(key => [key, data[key]]) as Array<[string, string]>;
  return new Map(entries);
}
