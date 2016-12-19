/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {expect, assert} from 'chai';
import {SourceMapConsumer} from 'source-map';

import {annotate} from '../src/tsickle';

import {createProgram} from './test_support';

import {toClosureJS, Settings} from '../src/main';

import * as ts from 'typescript';

import {toArray} from '../src/util';

import * as path from 'path';

describe('source maps', () => {
  it('generates a source map', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
      class X { field: number; }
      class Y { field2: string; }`);
    const program = createProgram(sources);
    const annotated = annotate(program, program.getSourceFile('input.ts'));
    const rawMap = (annotated.sourceMap as any).toJSON();
    const consumer = new SourceMapConsumer(rawMap);
    const lines = annotated.output.split('\n');
    // Uncomment to debug contents:
    // lines.forEach((v, i) => console.log(i + 1, v));
    // Find class X and class Y in the output to make the test robust against code changes.
    const firstClassLine = lines.findIndex(l => l.indexOf('class X') !== -1) + 1;
    const secondClassLine = lines.findIndex(l => l.indexOf('class Y') !== -1) + 1;
    expect(consumer.originalPositionFor({line: firstClassLine, column: 20}).line)
        .to.equal(2, 'first class definition');
    expect(consumer.originalPositionFor({line: secondClassLine, column: 20}).line)
        .to.equal(3, 'second class definition');
  });

  it('composes source maps with tsc', function() {
    this.timeout(3000);

    const diagnostics: ts.Diagnostic[] = [];

    const sources = new Map<string, string>();
    sources.set(ts.sys.resolvePath('input.ts'), `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const closure = toClosureJS({sourceMap: true} as ts.CompilerOptions, ['input.ts'], {isUntyped: false} as Settings, diagnostics, sources);

    if (!closure) {
      assert.fail();
      return;
    }

    const compiledJS = getFileWithName('input.js', closure.jsFiles);

    if (!compiledJS) {
      assert.fail();
      return;
    }

    const lines = compiledJS.split('\n');
    const stringXLine = lines.findIndex(l => l.indexOf('a string') !== -1) + 1;
    const stringXColumn = lines[stringXLine - 1].indexOf('a string') + 1;

    const sourceMapJson : any = getFileWithName('input.js.map', closure.jsFiles);
    const sourceMap = new SourceMapConsumer(sourceMapJson);
    expect(sourceMap.originalPositionFor({line: stringXLine, column: stringXColumn}).line)
        .to.equal(3, 'first string definition');
  });
});


function getFileWithName(filename: string, files: Map<string, string>): string | undefined {
  for (let filepath of toArray(files.keys())) {
    if (path.parse(filepath).base === filename) {
      return files.get(filepath);
    }
  }
}
