/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {expect} from 'chai';
import * as path from 'path';
import {SourceMapConsumer} from 'source-map';
import * as ts from 'typescript';

import {DefaultSourceMapper, sourceMapTextToConsumer} from '../src/source_map_utils';
import * as transformer from '../src/transformer';
import * as tsickle from '../src/tsickle';

import * as testSupport from './test_support';

describe('source maps', () => {
  it('generates a source map', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
      class X { field: number; }
      class Y { field2: string; }`);
    const tsHost = ts.createCompilerHost(testSupport.compilerOptions);
    const program = testSupport.createProgram(sources, tsHost);
    const sourceMapper = new DefaultSourceMapper('input.ts');
    const tsickleHost: tsickle.Host = {pathToModuleName: () => 'input'};
    const annotated = tsickle.annotate(
        program.getTypeChecker(), program.getSourceFile('input.ts'), tsickleHost, {}, tsHost,
        testSupport.compilerOptions, sourceMapper);
    const rawMap = sourceMapper.sourceMap.toJSON();
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

  it('generates a source map with transformers', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
      class X { field: number; }
      class Y { field2: string; }`);
    const tsCompilerOptions: ts.CompilerOptions = {
      ...testSupport.compilerOptions,
      sourceMap: true,
      inlineSourceMap: false
    };
    const tsHost = ts.createCompilerHost(tsCompilerOptions);
    const program = testSupport.createProgram(sources, tsHost, tsCompilerOptions);
    const transformerHost: transformer.TransformerHost = {
      shouldSkipTsickleProcessing: (fileName) => !sources.has(fileName),
      shouldIgnoreWarningsForPath: () => false,
      pathToModuleName: (context, importPath) => {
        importPath = importPath.replace(/(\.d)?\.[tj]s$/, '');
        if (importPath[0] === '.') importPath = path.join(path.dirname(context), importPath);
        return importPath.replace(/\/|\\/g, '.');
      },
      fileNameToModuleId: (fileName) => fileName.replace(/^\.\//, ''),
    };
    const transfromerOptions: transformer.TransformerOptions = {
      es5Mode: true,
      prelude: '',
      googmodule: true,
      convertIndexImportShorthand: true,
      transformDecorators: true,
      transformTypesToClosure: true,
    };
    const emittedFiles: {[fileName: string]: string} = {};
    const {diagnostics, externs} = transformer.emitWithTsickle(
        program, transformerHost, transfromerOptions, tsHost, tsCompilerOptions, undefined,
        (fileName: string, data: string) => {
          emittedFiles[fileName] = data;
        });

    const consumer = sourceMapTextToConsumer(emittedFiles['./input.js.map']);
    const lines = emittedFiles['./input.js'].split('\n');
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
