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

import {compile, getLineAndColumn} from './test_support';

describe.only('source maps each node with transformer', () => {
  it('maps import declarations correctly', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `import * as ts from 'typescript';
      import {join, format as fmt} from 'path';
      ts.ModuleKind.CommonJS;
      join;
      fmt;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer: true});

    {
      const {line, column} = getLineAndColumn(compiledJS, `var ts`);
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'typescript require');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, `goog.require('typescript')`);
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'typescript require');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, `var path_1`);
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(2, 'path require');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, `goog.require('path')`);
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(2, 'path require');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });

  it('maps export declarations correctly', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `export const x = 4;
      const y = 'stringy';
      export {y};
      export {format as fmt} from "path";`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer: true});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'exports.x = 4;');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'x export');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'exports.y = y;');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(3, 'y export');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'exports.fmt');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(4, 'fmt export');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'path_1.format');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(4, 'fmt export');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });

  it('maps element access', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `class X {
        [propName: string]: any;
      }

      const x = new X();
      x.foo;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer: true});

    {
      const {line, column} = getLineAndColumn(compiledJS, '["foo"];');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(6, 'rewritten element access');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
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
    const {compiledJS, sourceMap} = compile(sources, {useTransformer: true});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'classAnnotation, args');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(7, 'individual decorator type');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, `x: 'thingy'`);
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(8, 'individual decorator args');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });
});