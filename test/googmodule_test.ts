/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {expect, use as chaiUse} from 'chai';
import * as ts from 'typescript';
// tslint:disable-next-line:no-require-imports chai-diff needs a CommonJS import.
import chaiDiff = require('chai-diff');

import * as cliSupport from '../src/cli_support';
import * as googmodule from '../src/googmodule';
import * as transformerUtil from '../src/transformer_util';
import {ModulesManifest} from '../src/modules_manifest';
import * as tsickle from '../src/tsickle';

import * as testSupport from './test_support';
import {getCommonParentDirectory} from '../src/util';
import {visitNodeWithSynthesizedComments} from '../src/transformer_util';

chaiUse(chaiDiff);

function processES5(
    fileName: string, content: string,
    {isES5 = true, importHelpers = true, isJsTranspilation = false} = {}) {
  const options =
      Object.assign({}, testSupport.compilerOptions, {importHelpers, allowJs: isJsTranspilation});
  options.outDir = 'fakeOutDir';
  const tsHost = testSupport.createSourceCachingHost(new Map([[fileName, content]]));
  const host: googmodule.GoogModuleProcessorHost = {
    fileNameToModuleId: (fn: string) => fn,
    pathToModuleName: cliSupport.pathToModuleName.bind(null, process.cwd()),
    es5Mode: isES5,
    options: testSupport.compilerOptions,
    host: tsHost,
    isJsTranspilation,
  };
  const program = ts.createProgram([fileName], options, tsHost);
  // NB: this intentionally only checks for syntactical issues, but allows semantic issues, such
  // as missing imports to make the tests below easier to write.
  expect(tsickle.formatDiagnostics(program.getSyntacticDiagnostics())).to.equal('');
  const typeChecker = program.getTypeChecker();
  const diagnostics: ts.Diagnostic[] = [];
  const manifest = new ModulesManifest();
  let output: string|null = null;
  const res = program.emit(undefined, (fn, content) => {
    output = content;
  }, undefined, false, transformerUtil.createCustomTransformers({
    before: [transformerUtil.noOpTransformer],
    after: [googmodule.commonJsToGoogmoduleTransformer(host, manifest, typeChecker, diagnostics)]
  }));
  diagnostics.push(...res.diagnostics);
  expect(diagnostics).to.deep.equal([]);
  if (!output) throw new Error('no output');
  return {output, manifest};
}

describe('convertCommonJsToGoogModule', () => {
  function expectCommonJs(fileName: string, content: string, isES5 = true, importHelpers = true) {
    return expect(processES5(fileName, content, {isES5, importHelpers}).output);
  }

  it('adds a goog.module call', () => {
    // NB: no line break added below.
    expectCommonJs('a.ts', `console.log('hello');`).not.differentFrom(`goog.module('a');
var module = module || { id: 'a.ts' };
console.log('hello');
`);
  });

  it('adds a goog.module call for ES6 mode', () => {
    // NB: no line break added below.
    expectCommonJs('a.ts', `console.log('hello');`, false).not.differentFrom(`goog.module('a');
var module = module || { id: 'a.ts' };
module = module;
exports = {};
console.log('hello');
`);
  });

  it('adds a goog.module call to empty files', () => {
    expectCommonJs('a.ts', ``).not.differentFrom(`goog.module('a');
var module = module || { id: 'a.ts' };
`);
  });

  it('adds a goog.module call to empty-looking files', () => {
    expectCommonJs('a.ts', `// empty`).not.differentFrom(`// empty
goog.module('a');
var module = module || { id: 'a.ts' };
`);
  });

  it('strips use strict directives', () => {
    // NB: no line break added below.
    expectCommonJs('a.ts', `"use strict";
console.log('hello');`)
        .not.differentFrom(`goog.module('a');
var module = module || { id: 'a.ts' };
console.log('hello');
`);
  });

  it('converts imports to goog.require calls', () => {
    expectCommonJs('a.ts', `import {x} from 'req/mod'; console.log(x);`)
        .not.differentFrom(`goog.module('a');
var module = module || { id: 'a.ts' };
var mod_1 = goog.require('req.mod');
console.log(mod_1.x);
`);
  });

  it('converts side-effect import to goog.require calls', () => {
    expectCommonJs('a.ts', `import 'req/mod';`).not.differentFrom(`goog.module('a');
var module = module || { id: 'a.ts' };
var tsickle_module_1_ = goog.require('req.mod');
`);
  });

  it('converts imports to goog.require calls without assignments after comments', () => {
    // NB: tsickle incorrectly drops the comment below because it only synthesizes comments that
    // appear like file comments to it. It's unclear if there's a deeper reason for that.
    expectCommonJs('a.ts', `
// Comment
import 'req/mod';`)
        .not.differentFrom(`goog.module('a');
var module = module || { id: 'a.ts' };
// Comment
var tsickle_module_1_ = goog.require('req.mod');
`);
  });

  it('keeps fileoverview comments before imports', () => {
    expectCommonJs('a.ts', `/** @modName {mod_a} */

import {dep} from './dep';
import {sharedDep} from './shared_dep';

console.log('in mod_a', dep, sharedDep);
`).not.differentFrom(`/** @modName {mod_a} */
goog.module('a');
var module = module || { id: 'a.ts' };
var dep_1 = goog.require('dep');
var shared_dep_1 = goog.require('shared_dep');
console.log('in mod_a', dep_1.dep, shared_dep_1.sharedDep);
`);
  });

  describe('ES5 export *', () => {
    const dontImportHelpers = false;
    it('converts export * statements', () => {
      expectCommonJs('a.ts', `export * from 'req/mod';`, true).not.differentFrom(`goog.module('a');
var module = module || { id: 'a.ts' };
var tslib_1 = goog.require('tslib');
var tsickle_module_1_ = goog.require('req.mod');
tslib_1.__exportStar(tsickle_module_1_, exports);
`);
    });
    it('converts export * statements without helpers', () => {
      expectCommonJs('a.ts', `export * from 'req/mod';`, true, dontImportHelpers)
          .not.differentFrom(`function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
goog.module('a');
var module = module || { id: 'a.ts' };
var tsickle_module_1_ = goog.require('req.mod');
__export(tsickle_module_1_);
`);
    });
    it('uses correct module name with subsequent exports', () => {
      expectCommonJs('a.ts', `export * from 'req/mod';
import {x} from 'req/mod';
console.log(x);
`).not.differentFrom(`goog.module('a');
var module = module || { id: 'a.ts' };
var tslib_1 = goog.require('tslib');
var tsickle_module_1_ = goog.require('req.mod');
tslib_1.__exportStar(tsickle_module_1_, exports);
var mod_1 = tsickle_module_1_;
console.log(mod_1.x);
`);
    });
    it('reuses an existing imported variable name', () => {
      expectCommonJs('a.ts', `import {x} from 'req/mod';
export * from 'req/mod';
console.log(x);`)
          .not.differentFrom(`goog.module('a');
var module = module || { id: 'a.ts' };
var tslib_1 = goog.require('tslib');
var mod_1 = goog.require('req.mod');
var tsickle_module_1_ = mod_1;
tslib_1.__exportStar(tsickle_module_1_, exports);
console.log(mod_1.x);
`);
    });
  });


  it('resolves relative module URIs', () => {
    // See below for more fine-grained unit tests.
    expectCommonJs('a/b.ts', `import {x} from './req/mod';
console.log(x);`)
        .not.differentFrom(`goog.module('a.b');
var module = module || { id: 'a/b.ts' };
var mod_1 = goog.require('a.req.mod');
console.log(mod_1.x);
`);
  });

  it('avoids mangling module names in goog: imports', () => {
    expectCommonJs('a/b.ts', `
import Foo from 'goog:foo_bar.baz';
console.log(Foo);`)
        .not.differentFrom(`goog.module('a.b');
var module = module || { id: 'a/b.ts' };
var goog_foo_bar_baz_1 = goog.require('foo_bar.baz');
console.log(goog_foo_bar_baz_1);
`);
  });

  it('resolves default goog: module imports', () => {
    expectCommonJs('a/b.ts', `
import Foo from 'goog:use.Foo';
console.log(Foo);`)
        .not.differentFrom(`goog.module('a.b');
var module = module || { id: 'a/b.ts' };
var goog_use_Foo_1 = goog.require('use.Foo');
console.log(goog_use_Foo_1);
`);
  });

  it('resolves renamed default goog: module imports', () => {
    expectCommonJs('a/b.ts', `
import {default as Foo} from 'goog:use.Foo';
console.log(Foo);`)
        .not.differentFrom(`goog.module('a.b');
var module = module || { id: 'a/b.ts' };
var goog_use_Foo_1 = goog.require('use.Foo');
console.log(goog_use_Foo_1);
`);
  });

  it('resolves exported default goog: module imports', () => {
    expectCommonJs('a/b.ts', `
export {default as Foo} from 'goog:use.Foo';
`).not.differentFrom(`goog.module('a.b');
var module = module || { id: 'a/b.ts' };
var goog_use_Foo_1 = goog.require('use.Foo');
exports.Foo = goog_use_Foo_1;
`);
  });

  it('rewrites access to .default properties on goog: module namespace imports', () => {
    expectCommonJs('a/b.ts', `
import * as Foo from 'goog:use.Foo';
console.log(Foo.default);
`).not.differentFrom(`goog.module('a.b');
var module = module || { id: 'a/b.ts' };
var Foo = goog.require('use.Foo');
console.log(Foo);
`);
  });

  it('leaves single .default accesses alone', () => {
    // This is a repro for a bug when no goog: symbols are found.
    expectCommonJs('a/b.ts', `
console.log(this.default);
console.log(foo.bar.default);`)
        .not.differentFrom(`goog.module('a.b');
var module = module || { id: 'a/b.ts' };
console.log(this.default);
console.log(foo.bar.default);
`);
  });

  it('strips "use strict" (implied by goog.module)', () => {
    // NB: the comment below is missing, see comment on the 'after comments' case above.
    expectCommonJs('a/b.ts', `/**
 * docstring here
 */
"use strict";
var foo = bar;
`).not.differentFrom(`goog.module('a.b');
var module = module || { id: 'a/b.ts' };
var foo = bar;
`);
  });

  it('deduplicates module imports', () => {
    expectCommonJs('a/b.ts', `import Foo from 'goog:foo';
import Foo2 from 'goog:foo';
Foo, Foo2;
`).not.differentFrom(`goog.module('a.b');
var module = module || { id: 'a/b.ts' };
var goog_foo_1 = goog.require('foo');
var goog_foo_2 = goog_foo_1;
goog_foo_1, goog_foo_2;
`);
  });

  it('gathers referenced modules', () => {
    const {output, manifest} = processES5('a/b.ts', `
import '../foo/bare_require';
import sym from 'goog:foo.bar';
import {es6RelativeRequire} from './relative';
import {es6NonRelativeRequire} from 'non/relative';
console.log(sym, es6RelativeRequire, es6NonRelativeRequire);
`);

    // Sanity check the output.
    expect(output).not.differentFrom(`goog.module('a.b');
var module = module || { id: 'a/b.ts' };
var tsickle_module_1_ = goog.require('foo.bare_require');
var goog_foo_bar_1 = goog.require('foo.bar');
var relative_1 = goog.require('a.relative');
var relative_2 = goog.require('non.relative');
console.log(goog_foo_bar_1, relative_1.es6RelativeRequire, relative_2.es6NonRelativeRequire);
`);

    expect(manifest.getReferencedModules('a/b.ts')).to.deep.equal([
      'foo.bare_require',
      'foo.bar',
      'a.relative',
      'non.relative',
    ]);
  });

  it(`skips the exports assignment if there's another one`, () => {
    expectCommonJs('a.ts', `export {}; console.log('hello'); exports = 1;`, false)
        .not.differentFrom(`goog.module('a');
var module = module || { id: 'a.ts' };
module = module;
console.log('hello');
exports = 1;
`);
  });
});

describe('processing transpiled JS output', () => {
  function expectJsTranspilation(content: string) {
    return expect(processES5('irrelevant.js', content, {isJsTranspilation: true}).output);
  }

  it('does not insert goog.module() or module = ... in JS transpilation outputs', () => {
    expectJsTranspilation(`alert(1);`).not.differentFrom(`alert(1);
`);
  });

  it('changes require("tslib") to goog.require("tslib")', () => {
    expectJsTranspilation(`require('tslib');`).not.differentFrom(`goog.require('tslib');
`);
  });

  it('does not turn require() into goog.require()', () => {
    expectJsTranspilation(`require('foo'); var x = require('bar');`)
        .not.differentFrom(`require('foo');
var x = require('bar');
`);
  });

  it('leaves goog.require() alone', () => {
    expectJsTranspilation(`goog.require('foo'); var x = goog.require('bar');`)
        .not.differentFrom(`goog.require('foo');
var x = goog.require('bar');
`);
  });
});
