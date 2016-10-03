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
    // Uncomment to debug contents:
    // annotated.output.split('\n').forEach((v, i) => console.log(i + 1, v));
    expect(consumer.originalPositionFor({line: 2, column: 20}).line)
        .to.equal(2, 'first class definition');
    expect(consumer.originalPositionFor({line: 9, column: 20}).line)
        .to.equal(3, 'second class definition');
  });
});
