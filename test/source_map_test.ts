/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SourceMapConsumer, SourceMapGenerator} from 'source-map';
import * as ts from 'typescript';

import {SourceMapGeneratorToJson, SourceMapper, SourcePosition} from '../src/source_map_utils';
import {annotate} from '../src/tsickle';

import {createProgramAndHost} from './test_support';

/**
 * A SourceMapper that directly maps into a source map generator.
 * Used to test the source mapping implementation (see below).
 */
class TestSourceMapper implements SourceMapper {
  /** The source map that's generated while rewriting this file. */
  sourceMap = new SourceMapGenerator();

  constructor(private fileName: string) {
    this.sourceMap.addMapping({
      // tsc's source maps use 1-indexed lines, 0-indexed columns
      original: {line: 1, column: 0},
      generated: {line: 1, column: 0},
      source: this.fileName,
    });
  }

  shiftByOffset(n: number) {
    throw new Error('not implemented');
  }

  addMapping(node: ts.Node, original: SourcePosition, generated: SourcePosition, length: number):
      void {
    if (length <= 0) return;
    this.sourceMap.addMapping({
      // tsc's source maps use 1-indexed lines, 0-indexed columns
      original: {line: original.line + 1, column: original.column},
      generated: {line: generated.line + 1, column: generated.column},
      source: this.fileName,
    });
  }
}

describe('source maps', () => {
  it('generates a source map', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
      class X { field: number; }
      class Y { field2: string; }`);
    const {program, host} = createProgramAndHost(sources);
    const sourceMapper = new TestSourceMapper('input.ts');
    const annotated = annotate(
        program.getTypeChecker(), program.getSourceFile('input.ts')!,
        {pathToModuleName: () => 'input'}, host, program.getCompilerOptions(), sourceMapper);
    const rawMap = (sourceMapper.sourceMap as SourceMapGeneratorToJson).toJSON();
    const consumer = new SourceMapConsumer(rawMap);
    const lines = annotated.output.split('\n');
    // Uncomment to debug contents:
    // lines.forEach((v, i) => console.log(i + 1, v));
    // Find class X and class Y in the output to make the test robust against code changes.
    const firstClassLine = lines.findIndex(l => l.indexOf('class X') !== -1) + 1;
    const secondClassLine = lines.findIndex(l => l.indexOf('class Y') !== -1) + 1;
    expect(consumer.originalPositionFor({line: firstClassLine, column: 20}).line)
        .toBe(2, 'first class definition');
    expect(consumer.originalPositionFor({line: secondClassLine, column: 20}).line)
        .toBe(3, 'second class definition');
  });
});
