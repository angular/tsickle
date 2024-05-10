/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

import {assertAbsolute} from '../src/cli_support';
import * as tsickle from '../src/tsickle';

import * as testSupport from './test_support';
import {outdent} from './test_support';

describe('emitWithTsickle', () => {
  function emitWithTsickle(
    tsSources: {[fileName: string]: string},
    tsConfigOverride: Partial<ts.CompilerOptions> = {},
    tsickleHostOverride: Partial<tsickle.TsickleHost> = {},
    customTransformers?: tsickle.EmitTransformers,
  ) {
    const tsCompilerOptions: ts.CompilerOptions = {
      ...testSupport.compilerOptions,
      target: ts.ScriptTarget.ES5,
      ...tsConfigOverride,
    };

    const sources = new Map<string, string>();
    for (const fileName of Object.keys(tsSources)) {
      sources.set(
        path.join(tsCompilerOptions.rootDir!, fileName),
        tsSources[fileName],
      );
    }
    const {program} = testSupport.createProgramAndHost(
      sources,
      tsCompilerOptions,
    );
    testSupport.expectDiagnosticsEmpty(ts.getPreEmitDiagnostics(program));
    const tsickleHost: tsickle.TsickleHost = {
      generateExtraSuppressions: false,
      googmodule: false,
      transformDecorators: true,
      transformTypesToClosure: true,
      generateTsMigrationExportsShim: false,
      logWarning: (diag: ts.Diagnostic) => {},
      shouldSkipTsickleProcessing: (fileName) => {
        assertAbsolute(fileName);
        return !sources.has(fileName);
      },
      shouldIgnoreWarningsForPath: () => false,
      pathToModuleName: (context, importPath) => {
        importPath = importPath.replace(/(\.d)?\.[tj]s$/, '');
        if (importPath[0] === '.') {
          importPath = path.join(path.dirname(context), importPath);
        }
        return importPath.replace(/\/|\\/g, '.');
      },
      fileNameToModuleId: (fileName) => fileName.replace(/^\.\//, ''),
      options: tsCompilerOptions,
      rootDirsRelative: testSupport.relativeToTsickleRoot,
      transformDynamicImport: 'closure',
      ...tsickleHostOverride,
    };
    const jsSources: {[fileName: string]: string} = {};
    const {diagnostics} = tsickle.emit(
      program,
      tsickleHost,
      (fileName: string, data: string) => {
        jsSources[path.relative(tsCompilerOptions.rootDir!, fileName)] = data;
      },
      /* sourceFile */ undefined,
      /* cancellationToken */ undefined,
      /* emitOnlyDtsFiles */ undefined,
      customTransformers,
    );
    return {jsSources, diagnostics};
  }

  it('should run custom transformers for files with skipTsickleProcessing', () => {
    function transformValue(context: ts.TransformationContext) {
      return (sourceFile: ts.SourceFile): ts.SourceFile => {
        return visitNode(sourceFile) as ts.SourceFile;

        function visitNode(node: ts.Node): ts.Node {
          if (node.kind === ts.SyntaxKind.NumericLiteral) {
            return ts.factory.createNumericLiteral(2);
          }
          return ts.visitEachChild(node, visitNode, context);
        }
      };
    }

    const tsSources = {
      'a.ts': `export const x = 1;`,
    };
    const {jsSources} = emitWithTsickle(
      tsSources,
      undefined,
      {
        shouldSkipTsickleProcessing: () => true,
      },
      {beforeTs: [transformValue]},
    );

    expect(jsSources['a.js']).toContain('exports.x = 2;');
  });

  it('escapes JSDoc on const enums in unoptimized namespaces', () => {
    const tsSources = {
      'a.ts': outdent(`
        namespace Foo {
          /** @customTag */
          export const enum Bar { A }
        }
      `),
    };

    const {jsSources} = emitWithTsickle(
      tsSources,
      {
        preserveConstEnums: true,
        module: ts.ModuleKind.ES2015,
      },
      {
        useDeclarationMergingTransformation: false,
      },
    );

    expect(jsSources['a.js']).toContain(
      outdent(`
      (function (Foo) {
          /**
           * \\@customTag
           */
          var Bar;
    `),
    );
  });

  describe('const enum exports', () => {
    it('should export value when preserveConstEnums is enabled (from .ts file)', () => {
      const tsSources = {
        // Simulate a.ts, b.ts and c.ts being in the same compilation unit.
        'a.ts': `export const enum Foo { Bar }`,
        'b.ts': `export * from './a';`,
        'c.ts': `export {Foo as Bar} from './a';`,
      };

      const {jsSources} = emitWithTsickle(tsSources, {
        preserveConstEnums: true,
        module: ts.ModuleKind.ES2015,
      });

      expect(jsSources['b.js']).toContain(`export { Foo } from './a';`);
      expect(jsSources['c.js']).toContain(`export { Foo as Bar } from './a';`);
    });

    it('should export type when preserveConstEnums is enabled (from .d.ts file)', () => {
      const tsSources = {
        // Simulate a.d.ts coming from a different compilation unit.
        'a.d.ts': `export declare const enum Foo { Bar = 0 }`,
        'b.ts': `export * from './a';`,
        'c.ts': `export {Foo as Bar} from './a';`,
      };

      const {jsSources} = emitWithTsickle(tsSources, {
        preserveConstEnums: true,
        module: ts.ModuleKind.ES2015,
      });

      expect(jsSources['b.js']).toContain(`exports.Foo; // re-export typedef`);
      expect(jsSources['c.js']).toContain(`exports.Bar; // re-export typedef`);
    });

    it('should export type when preserveConstEnums is disabled', () => {
      const tsSources = {
        'a.ts': `export const enum Foo { Bar }`,
        'b.ts': `export * from './a';`,
        'c.ts': `export {Foo as Bar} from './a';`,
      };

      const {jsSources} = emitWithTsickle(tsSources, {
        preserveConstEnums: false,
        module: ts.ModuleKind.ES2015,
      });

      expect(jsSources['b.js']).toContain(`exports.Foo; // re-export typedef`);
      expect(jsSources['c.js']).toContain(`exports.Bar; // re-export typedef`);
    });
  });

  it('should not go into an infinite loop with a self-referential type', () => {
    const tsSources = {
      'a.ts': `export function f() : typeof f { return f; }`,
    };

    const {jsSources} = emitWithTsickle(tsSources, {
      module: ts.ModuleKind.ES2015,
    });

    expect(jsSources['a.js']).toContain(
      outdent(`
      /**
       * @return {function(): ?}
       */
      export function f() { return f; }
    `),
    );
  });

  it('reports multi-provides error with jsPathToModuleName impl', () => {
    const tsSources = {
      'a.ts': `import {} from 'google3/multi/provide';`,
      'clutz.d.ts': `declare module 'google3/multi/provide' { export {}; }`,
    };
    const {diagnostics} = emitWithTsickle(
      tsSources,
      /* tsConfigOverride= */ undefined,
      /* tsickleHostOverride= */ {
        jsPathToModuleName(importPath: string) {
          if (importPath === 'google3/multi/provide') {
            return {
              name: 'multi.provide',
              multipleProvides: true,
            };
          }
          return undefined;
        },
      },
    );
    expect(testSupport.formatDiagnostics(diagnostics)).toContain(
      'referenced JavaScript module google3/multi/provide provides multiple namespaces and cannot be imported by path',
    );
  });

  it('allows side-effect import of multi-provides module', () => {
    const tsSources = {
      'a.ts': `import 'google3/multi/provide';`,
      'clutz.d.ts': `declare module 'google3/multi/provide' { export {}; }`,
    };
    const {jsSources} = emitWithTsickle(
      tsSources,
      /* tsConfigOverride= */ undefined,
      /* tsickleHostOverride= */ {
        googmodule: true,
        jsPathToModuleName(importPath: string) {
          if (importPath === 'google3/multi/provide') {
            return {
              name: 'multi.provide',
              multipleProvides: true,
            };
          }
          return undefined;
        },
      },
    );
    expect(jsSources['a.js']).toContain(`goog.require('multi.provide');`);
  });

  describe('regressions', () => {
    it('should produce correct .d.ts files when expanding `export *` with es2015 module syntax', () => {
      const tsSources = {
        'a.ts': `export const x = 1;`,
        'b.ts': `export * from './a';\n`,
      };
      const {jsSources} = emitWithTsickle(tsSources, {
        declaration: true,
        module: ts.ModuleKind.ES2015,
      });

      expect(jsSources['b.d.ts']).toEqual(
        outdent(`
           //!! generated by tsickle from b.ts
           export * from './a';
         `),
      );
    });
  });
});
