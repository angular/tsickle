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
import * as es5processor from '../src/es5processor';

import * as testSupport from './test_support';

chaiUse(chaiDiff);

describe('convertCommonJsToGoogModule', () => {
  function processES5(fileName: string, content: string, isES5 = true, prelude = '') {
    const options = testSupport.compilerOptions;
    const tsHost = ts.createCompilerHost(options);
    const host: es5processor.Es5ProcessorHost = {
      fileNameToModuleId: (fn) => fn,
      pathToModuleName: cliSupport.pathToModuleName,
      es5Mode: isES5,
      prelude,
      options: testSupport.compilerOptions,
      host: tsHost,
    };
    return es5processor.processES5(host, fileName, content);
  }

  function expectCommonJs(fileName: string, content: string, isES5 = true, prelude = '') {
    return expect(processES5(fileName, content, isES5, prelude).output);
  }

  it('adds a goog.module call', () => {
    // NB: no line break added below.
    expectCommonJs('a.js', `console.log('hello');`)
        .not.differentFrom(
            `goog.module('a');var module = module || {id: 'a.js'};console.log('hello');`);
  });

  it('adds a goog.module call for ES6 mode', () => {
    // NB: no line break added below.
    expectCommonJs('a.js', `console.log('hello');`, false)
        .not.differentFrom(
            `goog.module('a'); exports = {}; var module = module || {id: 'a.js'}; module = module;console.log('hello');`);
  });

  it('adds a goog.module call to empty files', () => {
    expectCommonJs('a.js', ``)
        .not.differentFrom(`goog.module('a');var module = module || {id: 'a.js'};`);
  });

  it('adds a goog.module call to empty-looking files', () => {
    expectCommonJs('a.js', `// empty`)
        .not.differentFrom(`goog.module('a');var module = module || {id: 'a.js'};// empty`);
  });

  it('strips use strict directives', () => {
    // NB: no line break added below.
    expectCommonJs('a.js', `"use strict";
console.log('hello');`)
        .not.differentFrom(`goog.module('a');var module = module || {id: 'a.js'};
console.log('hello');`);
  });

  it('converts require calls', () => {
    expectCommonJs('a.js', `var r = require('req/mod');`)
        .not.differentFrom(
            `goog.module('a');var module = module || {id: 'a.js'};` +
            `var r = goog.require('req.mod');`);
  });

  it('converts require calls without assignments on first line', () => {
    expectCommonJs('a.js', `require('req/mod');`)
        .not.differentFrom(
            `goog.module('a');var module = module || {id: 'a.js'};` +
            `var tsickle_module_0_ = goog.require('req.mod');`);
  });

  it('converts require calls without assignments on a new line', () => {
    expectCommonJs('a.js', `
require('req/mod');
require('other');`)
        .not.differentFrom(`goog.module('a');var module = module || {id: 'a.js'};
var tsickle_module_0_ = goog.require('req.mod');
var tsickle_module_1_ = goog.require('other');`);
  });

  it('converts require calls without assignments after comments', () => {
    expectCommonJs('a.js', `
// Comment
require('req/mod');`)
        .not.differentFrom(`goog.module('a');var module = module || {id: 'a.js'};
// Comment
var tsickle_module_0_ = goog.require('req.mod');`);
  });

  it('converts const require calls', () => {
    expectCommonJs('a.js', `const r = require('req/mod');`)
        .not.differentFrom(
            `goog.module('a');var module = module || {id: 'a.js'};` +
            `var r = goog.require('req.mod');`);
  });

  describe('ES5 export *', () => {
    it('converts export * statements', () => {
      expectCommonJs('a.js', `__export(require('req/mod'));`)
          .not.differentFrom(
              `goog.module('a');var module = module || {id: 'a.js'};var tsickle_module_0_ = goog.require('req.mod');__export(tsickle_module_0_);`);
    });
    it('uses correct module name with subsequent exports', () => {
      expectCommonJs('a.js', `__export(require('req/mod'));
var mod2 = require('req/mod');`)
          .not.differentFrom(
              `goog.module('a');var module = module || {id: 'a.js'};var tsickle_module_0_ = goog.require('req.mod');__export(tsickle_module_0_);
var mod2 = tsickle_module_0_;`);
    });
    it('reuses an existing imported variable name', () => {
      expectCommonJs('a.js', `var mod = require('req/mod');
__export(require('req/mod'));`)
          .not.differentFrom(
              `goog.module('a');var module = module || {id: 'a.js'};var mod = goog.require('req.mod');
__export(mod);`);
    });

    it('converts tslib exportStar usage', () => {
      expectCommonJs('a.js', `tslib_1.__exportStar(require("./decorators"), exports);`)
          .not.differentFrom(
              `goog.module('a');var module = module || {id: 'a.js'};var tsickle_module_0_ = goog.require('decorators');tslib_1.__exportStar(tsickle_module_0_, exports);`);
    });
  });

  it('resolves relative module URIs', () => {
    // See below for more fine-grained unit tests.
    expectCommonJs('a/b.js', `var r = require('./req/mod');`)
        .not.differentFrom(
            `goog.module('a.b');var module = module || {id: 'a/b.js'};var r = goog.require('a.req.mod');`);
  });

  it('avoids mangling module names in goog: imports', () => {
    expectCommonJs('a/b.js', `
var goog_use_Foo_1 = require('goog:foo_bar.baz');`)
        .not.differentFrom(`goog.module('a.b');var module = module || {id: 'a/b.js'};
var goog_use_Foo_1 = goog.require('foo_bar.baz');`);
  });

  it('resolves default goog: module imports', () => {
    expectCommonJs('a/b.js', `
var goog_use_Foo_1 = require('goog:use.Foo');
console.log(goog_use_Foo_1.default);`)
        .not.differentFrom(`goog.module('a.b');var module = module || {id: 'a/b.js'};
var goog_use_Foo_1 = goog.require('use.Foo');
console.log(goog_use_Foo_1        );`);
    // NB: the whitespace above matches the .default part, so that
    // source maps are not impacted.
  });

  it('leaves single .default accesses alone', () => {
    // This is a repro for a bug when no goog: symbols are found.
    expectCommonJs('a/b.js', `
console.log(this.default);
console.log(foo.bar.default);`)
        .not.differentFrom(`goog.module('a.b');var module = module || {id: 'a/b.js'};
console.log(this.default);
console.log(foo.bar.default);`);
  });

  it('strips "use strict" (implied by goog.module)', () => {
    expectCommonJs('a/b.js', `/**
 * docstring here
 */
"use strict";
var foo = bar;
`).not.differentFrom(`goog.module('a.b');var module = module || {id: 'a/b.js'};/**
 * docstring here
 */

var foo = bar;
`);
  });

  it('inserts goog.module after fileoverview comments', () => {
    expectCommonJs('a/b.js', `/**
 * @fileoverview comment here.
 */
var foo = bar;
`).not.differentFrom(`/**
 * @fileoverview comment here.
 */
goog.module('a.b');var module = module || {id: 'a/b.js'};var foo = bar;
`);
  });

  it('deduplicates module imports', () => {
    expectCommonJs('a/b.js', `var foo_1 = require('goog:foo');
var foo_2 = require('goog:foo');
foo_1.A, foo_2.B, foo_2.default, foo_3.default;
`)
        .not.differentFrom(
            `goog.module('a.b');var module = module || {id: 'a/b.js'};var foo_1 = goog.require('foo');
var foo_2 = foo_1;
foo_1.A, foo_2.B, foo_2        , foo_3.default;
`);
  });

  it('gathers referenced modules', () => {
    const {referencedModules} = processES5('a/b', `
require('../foo/bare_require');
var googRequire = require('goog:foo.bar');
var es6RelativeRequire = require('./relative');
var es6NonRelativeRequire = require('non/relative');
__export(require('./export_star');
`);

    return expect(referencedModules).to.deep.equal([
      'foo.bare_require',
      'foo.bar',
      'a.relative',
      'non.relative',
      'a.export_star',
    ]);
  });

  it('inserts a prelude', () => {
    expectCommonJs('a.js', `console.log('hello');`, false, `goog.require('tshelpers');`)
        .not.differentFrom(
            `goog.module('a');goog.require('tshelpers'); ` +
            `exports = {}; ` +
            `var module = module || {id: 'a.js'}; module = module;` +
            `console.log('hello');`);
  });

  it(`skips the exports assignment if there's another one`, () => {
    expectCommonJs(
        'a.js', `console.log('hello'); module.exports = 1;`, false, `goog.require('tshelpers');`)
        .not.differentFrom(
            `goog.module('a');goog.require('tshelpers'); ` +
            `var module = module || {id: 'a.js'}; module = module;` +
            `console.log('hello'); exports = 1;`);
  });
});
