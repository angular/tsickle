/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tslint:disable:no-unused-expression mocha .to.be.empty getters.

import {expect} from 'chai';
import * as path from 'path';
import * as ts from 'typescript';

import * as tsickle from '../src/tsickle';

import {assertSourceMapping, compileWithTransfromer, findFileContentsByName, getSourceMapWithName, sourceMapCompilerOptions} from './test_support';

describe('source maps each node with transformer', () => {
  it('maps import declarations correctly', () => {
    const sources = new Map<string, string>();
    sources.set('exporter1.ts', `export const foo = 1;`);
    sources.set('exporter2.ts', `export const bar = 2;
      export const baz = 3;`);
    sources.set('input.ts', `import * as foo from './exporter1';
      import {bar, baz as quux} from './exporter2';
      foo.foo;
      bar;
      quux;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {files} = compileWithTransfromer(sources, sourceMapCompilerOptions);
    const compiledJs = files.get('input.js')!;
    const sourceMap = getSourceMapWithName('input.js.map', files);

    assertSourceMapping(compiledJs, sourceMap, 'var foo', {line: 1, source: 'input.ts'});
    assertSourceMapping(
        compiledJs, sourceMap, `goog.require('exporter1')`, {line: 1, source: 'input.ts'});
    assertSourceMapping(compiledJs, sourceMap, `var exporter2_1`, {line: 2, source: 'input.ts'});
    assertSourceMapping(
        compiledJs, sourceMap, `goog.require('exporter2')`, {line: 2, source: 'input.ts'});
  });

  it('maps export declarations correctly', () => {
    const sources = new Map<string, string>();
    sources.set('exporter.ts', `export const foo = 1;`);
    sources.set('input.ts', `export const x = 4;
      const y = 'stringy';
      export {y};
      export {foo as bar} from './exporter';`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {files} = compileWithTransfromer(sources, sourceMapCompilerOptions);
    const compiledJs = files.get('input.js')!;
    const sourceMap = getSourceMapWithName('input.js.map', files);

    assertSourceMapping(compiledJs, sourceMap, `exports.x = 4;`, {line: 1, source: 'input.ts'});
    assertSourceMapping(compiledJs, sourceMap, `exports.y = y;`, {line: 3, source: 'input.ts'});
    assertSourceMapping(compiledJs, sourceMap, `exports.bar`, {line: 4, source: 'input.ts'});
    assertSourceMapping(compiledJs, sourceMap, `exporter_1.foo`, {line: 4, source: 'input.ts'});
  });

  it('maps element access', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `class X {
        [propName: string]: any;
      }

      const x = new X();
      x.foo;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {files} = compileWithTransfromer(sources, sourceMapCompilerOptions);
    const compiledJs = files.get('input.js')!;
    const sourceMap = getSourceMapWithName('input.js.map', files);

    assertSourceMapping(compiledJs, sourceMap, `["foo"];`, {line: 6, source: 'input.ts'});
  });

  it('maps decorators', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
        /** @Annotation */
        function classAnnotation(t: any) {
            return t;
        }

        @classAnnotation({
            x: 'thingy',
        })
        class DecoratorTest1 {
            y: string;
        }`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {files} = compileWithTransfromer(sources, sourceMapCompilerOptions);
    const compiledJs = files.get('input.js')!;
    const sourceMap = getSourceMapWithName('input.js.map', files);

    assertSourceMapping(
        compiledJs, sourceMap, `classAnnotation, args`, {line: 7, source: 'input.ts'});
    assertSourceMapping(compiledJs, sourceMap, `x: 'thingy'`, {line: 8, source: 'input.ts'});
  });
});
