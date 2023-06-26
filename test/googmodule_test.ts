/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

import * as googmodule from '../src/googmodule';
import {ModulesManifest} from '../src/modules_manifest';

import * as testSupport from './test_support';

interface ResolvedNamespace {
  name: string;
  stripProperty?: string;
}

interface ProcessOptions {
  isES5?: boolean;
  pathToNamespaceMap?: Map<string, ResolvedNamespace>;
}

function processES5(
    fileName: string, content: string,
    {isES5 = true, pathToNamespaceMap}: ProcessOptions = {}) {
  const options = Object.assign({}, testSupport.compilerOptions);
  options.outDir = 'fakeOutDir';
  const rootDir = options.rootDir!;
  options.target = isES5 ? ts.ScriptTarget.ES5 : options.target;
  fileName = path.join(rootDir, fileName);
  const tsHost =
      testSupport.createSourceCachingHost(new Map([[fileName, content]]));
  const host: googmodule.GoogModuleProcessorHost = {
    fileNameToModuleId: (fn: string) => path.relative(rootDir, fn),
    pathToModuleName: (context, fileName) => testSupport.pathToModuleName(
        rootDir, context, fileName, options, tsHost),
    options,
    transformDynamicImport: 'closure',
  };
  if (pathToNamespaceMap) {
    host.jsPathToModuleName = (importPath: string) =>
        pathToNamespaceMap.get(importPath)?.name;
    host.jsPathToStripProperty = (importPath: string) =>
        pathToNamespaceMap.get(importPath)?.stripProperty;
  }

  const program = ts.createProgram([fileName], options, tsHost);
  // NB: this intentionally only checks for syntactical issues, but allows
  // semantic issues, such as missing imports to make the tests below easier to
  // write.
  expect(testSupport.formatDiagnostics(program.getSyntacticDiagnostics()))
      .toBe('');
  const typeChecker = program.getTypeChecker();
  const diagnostics: ts.Diagnostic[] = [];
  const manifest = new ModulesManifest();
  let output: string|null = null;
  const transformers = {
    after: [googmodule.commonJsToGoogmoduleTransformer(
        host, manifest, typeChecker)]
  };
  const res = program.emit(undefined, (fn, content) => {
    output = content;
  }, undefined, false, transformers);
  diagnostics.push(...res.diagnostics);
  expect(diagnostics).toEqual([]);
  if (!output) throw new Error('no output');
  return {output, manifest, rootDir};
}

/**
 * Remove the first line (if empty) and unindents the all other lines by the
 * amount of leading whitespace in the second line.
 */
function outdent(str: string) {
  const lines = str.split('\n');
  if (lines.length < 2) return str;
  if (lines.shift() !== '') return str;
  const indent = lines[0].match(/^ */)![0].length;
  for (let i = 0; i < lines.length; i++) {
    lines[i] = lines[i].substring(indent);
  }
  return lines.join('\n');
}

describe('convertCommonJsToGoogModule', () => {
  beforeEach(() => {
    testSupport.addDiffMatchers();
  });

  function expectCommonJs(fileName: string, content: string, isES5 = true) {
    return expect(processES5(fileName, content, {isES5}).output);
  }

  it('adds a goog.module call', () => {
    // NB: no line break added below.
    expectCommonJs('a.ts', `console.log('hello');`).toBe(outdent(`
      goog.module('a');
      var module = module || { id: 'a.ts' };
      goog.require('tslib');
      console.log('hello');
    `));
  });

  it('adds a goog.module call for ES6 mode', () => {
    // NB: no line break added below.
    expectCommonJs('a.ts', `console.log('hello');`, false).toBe(outdent(`
      goog.module('a');
      var module = module || { id: 'a.ts' };
      goog.require('tslib');
      console.log('hello');
    `));
  });

  it('adds a goog.module call to empty files', () => {
    expectCommonJs('a.ts', ``).toBe(outdent(`
      goog.module('a');
      var module = module || { id: 'a.ts' };
      goog.require('tslib');
    `));
  });

  it('adds a goog.module call to empty-looking files', () => {
    expectCommonJs('a.ts', `// empty`).toBe(outdent(`
      goog.module('a');
      var module = module || { id: 'a.ts' };
      goog.require('tslib');
      // empty
    `));
  });

  it('strips use strict directives', () => {
    // NB: no line break added below.
    expectCommonJs('a.ts', outdent(`
      "use strict";
      console.log('hello');
    `)).toBe(outdent(`
      goog.module('a');
      var module = module || { id: 'a.ts' };
      goog.require('tslib');
      console.log('hello');
    `));
  });

  it('converts imports to goog.require calls', () => {
    expectCommonJs('a.ts', `import {x} from 'req/mod'; console.log(x);`)
        .toBe(outdent(`
          goog.module('a');
          var module = module || { id: 'a.ts' };
          goog.require('tslib');
          var mod_1 = goog.require('req.mod');
          console.log(mod_1.x);
        `));
  });

  it('converts imports to goog.require calls using const in ES6 mode', () => {
    expectCommonJs(
        'a.ts', `import {x} from 'req/mod'; console.log(x);`,
        /* es5 mode= */ false)
        .toBe(outdent(`
          goog.module('a');
          var module = module || { id: 'a.ts' };
          goog.require('tslib');
          const mod_1 = goog.require('req.mod');
          console.log(mod_1.x);
        `));
  });

  it('converts side-effect import to goog.require calls', () => {
    expectCommonJs('a.ts', `import 'req/mod';`).toBe(outdent(`
      goog.module('a');
      var module = module || { id: 'a.ts' };
      goog.require('tslib');
      goog.require('req.mod');
    `));
  });

  it('converts imports to goog.require calls without assignments after comments',
     () => {
       expectCommonJs('a.ts', outdent(`
        // Comment
        import 'req/mod';
       `)).toBe(outdent(`
        goog.module('a');
        var module = module || { id: 'a.ts' };
        goog.require('tslib');
        // Comment
        goog.require('req.mod');
       `));
     });

  it('keeps fileoverview comments before imports', () => {
    expectCommonJs('a.ts', outdent(`
      /** @modName {mod_a} */

      import {dep} from './dep';
      import {sharedDep} from './shared_dep';

      console.log('in mod_a', dep, sharedDep);
    `)).toBe(outdent(`
      /** @modName {mod_a} */
      goog.module('a');
      var module = module || { id: 'a.ts' };
      goog.require('tslib');
      var dep_1 = goog.require('dep');
      var shared_dep_1 = goog.require('shared_dep');
      console.log('in mod_a', dep_1.dep, shared_dep_1.sharedDep);
    `));
  });

  it('keeps fileoverview comments not separated by newlines', () => {
    expectCommonJs('a.ts', outdent(`
      /** @modName {mod_a} */
      import {dep} from './dep';
      import {sharedDep} from './shared_dep';

      console.log('in mod_a', dep, sharedDep);
    `)).toBe(outdent(`
      goog.module('a');
      var module = module || { id: 'a.ts' };
      goog.require('tslib');
      /** @modName {mod_a} */
      var dep_1 = goog.require('dep');
      var shared_dep_1 = goog.require('shared_dep');
      console.log('in mod_a', dep_1.dep, shared_dep_1.sharedDep);
    `));
  });

  it('keeps fileoverview comments before elided imports', () => {
    expectCommonJs('a.ts', outdent(`
      /** @fileoverview Hello Comment. */

      import {TypeFromDep} from './dep';

      // Only uses the import as a type.
      const x: TypeFromDep = 1;

      console.log('in mod_a', x);
    `)).toBe(outdent(`
      /** @fileoverview Hello Comment. */
      goog.module('a');
      var module = module || { id: 'a.ts' };
      goog.require('tslib');
      // Only uses the import as a type.
      var x = 1;
      console.log('in mod_a', x);
    `));
  });

  describe('ES5 export *', () => {
    it('converts export * statements', () => {
      expectCommonJs('a.ts', `export * from 'req/mod';`, true).toBe(outdent(`
        goog.module('a');
        var module = module || { id: 'a.ts' };
        var tslib_1 = goog.require('tslib');
        var tsickle_module_1_ = goog.require('req.mod');
        tslib_1.__exportStar(tsickle_module_1_, exports);
      `));
    });

    it('uses correct module name with subsequent exports', () => {
      expectCommonJs('a.ts', outdent(`
        export * from 'req/mod';
        import {x} from 'req/mod';
        console.log(x);
      `)).toBe(outdent(`
        goog.module('a');
        var module = module || { id: 'a.ts' };
        var tslib_1 = goog.require('tslib');
        var tsickle_module_1_ = goog.require('req.mod');
        tslib_1.__exportStar(tsickle_module_1_, exports);
        var mod_1 = tsickle_module_1_;
        console.log(mod_1.x);
      `));
    });

    it('reuses an existing imported variable name', () => {
      expectCommonJs('a.ts', outdent(`
        import {x} from 'req/mod';
        export * from 'req/mod';
        console.log(x);
      `)).toBe(outdent(`
        goog.module('a');
        var module = module || { id: 'a.ts' };
        var tslib_1 = goog.require('tslib');
        var mod_1 = goog.require('req.mod');
        var tsickle_module_1_ = mod_1;
        tslib_1.__exportStar(tsickle_module_1_, exports);
        console.log(mod_1.x);
      `));
    });
  });

  it('resolves relative module URIs', () => {
    // See below for more fine-grained unit tests.
    expectCommonJs('a/b.ts', outdent(`
      import {x} from './req/mod';
      console.log(x);
    `)).toBe(outdent(`
      goog.module('a.b');
      var module = module || { id: 'a/b.ts' };
      goog.require('tslib');
      var mod_1 = goog.require('a.req.mod');
      console.log(mod_1.x);
    `));
  });

  it('avoids mangling module names in goog: imports', () => {
    expectCommonJs('a/b.ts', outdent(`
      import Foo from 'goog:foo_bar.baz';
      console.log(Foo);
    `)).toBe(outdent(`
      goog.module('a.b');
      var module = module || { id: 'a/b.ts' };
      goog.require('tslib');
      var goog_foo_bar_baz_1 = goog.require('foo_bar.baz');
      console.log(goog_foo_bar_baz_1);
    `));
  });

  it('resolves default goog: module imports', () => {
    expectCommonJs('a/b.ts', outdent(`
      import Foo from 'goog:use.Foo';
      console.log(Foo);
    `)).toBe(outdent(`
      goog.module('a.b');
      var module = module || { id: 'a/b.ts' };
      goog.require('tslib');
      var goog_use_Foo_1 = goog.require('use.Foo');
      console.log(goog_use_Foo_1);
    `));
  });

  it('resolves renamed default goog: module imports', () => {
    expectCommonJs('a/b.ts', outdent(`
      import {default as Foo} from 'goog:use.Foo';
      console.log(Foo);
    `)).toBe(outdent(`
      goog.module('a.b');
      var module = module || { id: 'a/b.ts' };
      goog.require('tslib');
      var goog_use_Foo_1 = goog.require('use.Foo');
      console.log(goog_use_Foo_1);
    `));
  });

  it('resolves exported default goog: module imports', () => {
    expectCommonJs('a/b.ts', outdent(`
      export {default as Foo} from 'goog:use.Foo';
    `)).toBe(outdent(`
      goog.module('a.b');
      var module = module || { id: 'a/b.ts' };
      goog.require('tslib');
      var goog_use_Foo_1 = goog.require('use.Foo');
      exports.Foo = goog_use_Foo_1;
    `));
  });

  it('rewrites access to .default properties on goog: module namespace imports',
     () => {
       expectCommonJs('a/b.ts', outdent(`
         import * as Foo from 'goog:use.Foo';
         console.log(Foo.default);
       `)).toBe(outdent(`
         goog.module('a.b');
         var module = module || { id: 'a/b.ts' };
         goog.require('tslib');
         var Foo = goog.require('use.Foo');
         console.log(Foo);
       `));
     });

  it('leaves single .default accesses alone', () => {
    // This is a repro for a bug when no goog: symbols are found.
    expectCommonJs('a/b.ts', outdent(`
      console.log(this.default);
      console.log(foo.bar.default);
    `)).toBe(outdent(`
      goog.module('a.b');
      var module = module || { id: 'a/b.ts' };
      goog.require('tslib');
      console.log(this.default);
      console.log(foo.bar.default);
      `));
  });

  it('strips "use strict" (implied by goog.module)', () => {
    expectCommonJs('a/b.ts', outdent(`
      /**
       * docstring here
       */
      "use strict";
      var foo = bar;
    `)).toBe(outdent(`
      /**
       * docstring here
       */
      goog.module('a.b');
      var module = module || { id: 'a/b.ts' };
      goog.require('tslib');
      var foo = bar;
    `));
  });

  it('deduplicates module imports', () => {
    expectCommonJs('a/b.ts', outdent(`
      import Foo from 'goog:foo';
      import Foo2 from 'goog:foo';
      Foo;
      Foo2;
    `)).toBe(outdent(`
      goog.module('a.b');
      var module = module || { id: 'a/b.ts' };
      goog.require('tslib');
      var goog_foo_1 = goog.require('foo');
      var goog_foo_2 = goog_foo_1;
      goog_foo_1;
      goog_foo_2;
    `));
  });

  it('gathers referenced modules', () => {
    const {output, manifest, rootDir} = processES5('a/b.ts', outdent(`
      import '../foo/bare_require';
      import sym from 'goog:foo.bar';
      import {es6RelativeRequire} from './relative';
      import {es6NonRelativeRequire} from 'non/relative';
      console.log(sym, es6RelativeRequire, es6NonRelativeRequire);
    `));

    // Sanity check the output.
    expect(output).toBe(outdent(`
      goog.module('a.b');
      var module = module || { id: 'a/b.ts' };
      goog.require('tslib');
      goog.require('foo.bare_require');
      var goog_foo_bar_1 = goog.require('foo.bar');
      var relative_1 = goog.require('a.relative');
      var relative_2 = goog.require('non.relative');
      console.log(goog_foo_bar_1, relative_1.es6RelativeRequire, relative_2.es6NonRelativeRequire);
    `));

    expect(manifest.getReferencedModules(path.join(rootDir, 'a/b.ts')))
        .toEqual([
          'foo.bare_require',
          'foo.bar',
          'a.relative',
          'non.relative',
        ]);
  });

  it(`skips the exports assignment if there's another one`, () => {
    expectCommonJs(
        'a.ts', `export {}; console.log('hello'); exports = 1;`, false)
        .toBe(outdent(`
          goog.module('a');
          var module = module || { id: 'a.ts' };
          goog.require('tslib');
          console.log('hello');
          exports = 1;
        `));
  });


  it('rewrites live export bindings', () => {
    const before = `
      Object.defineProperty(exports, 'foo', {
        enumerable: true, get: function() { return ns.bar; }
      });
    `;

    expectCommonJs('a.ts', before, false).toBe(outdent(`
      goog.module('a');
      var module = module || { id: 'a.ts' };
      goog.require('tslib');
      exports.foo = ns.bar;
    `));
  });

  it('elides default export values', () => {
    const before = `
      exports.foo = exports.bar = exports.baz = void 0;
      exports.boff = void 0;
      exports.foo = 1;
      exports.bar = 2;
      exports.baz = 3;
      exports.boff = 4;
    `;

    expectCommonJs('a.ts', before, false).toBe(outdent(`
      goog.module('a');
      var module = module || { id: 'a.ts' };
      goog.require('tslib');
      exports.foo = 1;
      exports.bar = 2;
      exports.baz = 3;
      exports.boff = 4;
    `));
  });

  describe('dynamic import', () => {
    it('handles dynamic imports', () => {
      const before = `
        (async () => {
          const starImport = await import('./relpath');
        })();
        export {};
      `;
      const beforeLines = (processES5('project/file.ts', before, {
                             isES5: false,
                           }).output as string)
                              .split(/\n/g);

      expect(beforeLines).toEqual(outdent(`
        goog.module('project.file');
        var module = module || { id: 'project/file.ts' };
        const tslib_1 = goog.require('tslib');
        (() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const starImport = yield goog.requireDynamic('project.relpath');
        }))();
      `).split(/\n/g));
    });

    it('handles dynamic imports for ES5', () => {
      const before = `
        (async () => {
          const starImport = await import('./relpath');
        })();
        export {};
      `;
      const beforeLines = (processES5('project/file.ts', before, {
                             isES5: true,
                           }).output as string)
                              .split(/\n/g);

      expect(beforeLines).toEqual(outdent(`
        goog.module('project.file');
        var module = module || { id: 'project/file.ts' };
        var tslib_1 = goog.require('tslib');
        (function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var starImport;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, goog.requireDynamic('project.relpath')];
                    case 1:
                        starImport = _a.sent();
                        return [2 /*return*/];
                }
            });
        }); })();
      `).split(/\n/g));
    });

    it('handles dynamic imports with destructuring LHS', () => {
      const before = `
        (async () => {
          const {Foo} = await import('./relpath');
        })();
        export {};
      `;
      const beforeLines = (processES5('project/file.ts', before, {
                             isES5: false,
                           }).output as string)
                              .split(/\n/g);

      expect(beforeLines).toEqual(outdent(`
        goog.module('project.file');
        var module = module || { id: 'project/file.ts' };
        const tslib_1 = goog.require('tslib');
        (() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const { Foo } = yield goog.requireDynamic('project.relpath');
        }))();
      `).split(/\n/g));
    });

    it('handles dynamic imports for ES5 with destructuring LHS', () => {
      const before = `
        (async () => {
          const {Foo}  = await import('./relpath');
        })();
        export {};
      `;
      const beforeLines = (processES5('project/file.ts', before, {
                             isES5: true,
                           }).output as string)
                              .split(/\n/g);

      expect(beforeLines).toEqual(outdent(`
        goog.module('project.file');
        var module = module || { id: 'project/file.ts' };
        var tslib_1 = goog.require('tslib');
        (function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var Foo;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, goog.requireDynamic('project.relpath')];
                    case 1:
                        Foo = (_a.sent()).Foo;
                        return [2 /*return*/];
                }
            });
        }); })();
      `).split(/\n/g));
    });
  });

  describe('resolve clutz modules with host provided methods', () => {
    const pathToNamespaceMap = new Map<string, ResolvedNamespace>([
      ['path/to/mod', {name: 'my.mod'}],
      ['path/to/strip/prop', {name: 'my.strip.prop', stripProperty: 'prop'}],
    ]);

    function expectCommonJs(fileName: string, content: string) {
      return expect(processES5(fileName, content, {pathToNamespaceMap}).output);
    }

    it('resolves module names', () => {
      expectCommonJs('a.ts', `import {x} from 'path/to/mod'; console.log(x);`)
          .toBe(outdent(`
            goog.module('a');
            var module = module || { id: 'a.ts' };
            goog.require('tslib');
            var mod_1 = goog.require('my.mod');
            console.log(mod_1.x);
          `));
    });

    it('resolves strip property', () => {
      expectCommonJs(
          'a.ts', `import {prop} from 'path/to/strip/prop'; console.log(prop);`)
          .toBe(outdent(`
            goog.module('a');
            var module = module || { id: 'a.ts' };
            goog.require('tslib');
            var prop_1 = goog.require('my.strip.prop');
            console.log(prop_1);
          `));
    });
  });
});
