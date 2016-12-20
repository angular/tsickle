/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {expect} from 'chai';
import {SourceMapConsumer} from 'source-map';

import {annotate} from '../src/tsickle';

import {createProgram} from './test_support';

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
});
