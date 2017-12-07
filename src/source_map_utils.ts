/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BasicSourceMapConsumer, RawSourceMap, SourceMapConsumer, SourceMapGenerator} from 'source-map';
import * as ts from './typescript';

/**
 * Return a new RegExp object every time we want one because the
 * RegExp object has internal state that we don't want to persist
 * between different logical uses.
 */
function getInlineSourceMapRegex(): RegExp {
  return new RegExp('^//# sourceMappingURL=data:application/json;base64,(.*)$', 'mg');
}

export function containsInlineSourceMap(source: string): boolean {
  return getInlineSourceMapCount(source) > 0;
}

export function getInlineSourceMapCount(source: string): number {
  const match = source.match(getInlineSourceMapRegex());
  return match ? match.length : 0;
}

export function extractInlineSourceMap(source: string): string {
  const inlineSourceMapRegex = getInlineSourceMapRegex();
  let previousResult: RegExpExecArray|null = null;
  let result: RegExpExecArray|null = null;
  // We want to extract the last source map in the source file
  // since that's probably the most recent one added.  We keep
  // matching against the source until we don't get a result,
  // then we use the previous result.
  do {
    previousResult = result;
    result = inlineSourceMapRegex.exec(source);
  } while (result !== null);
  const base64EncodedMap = previousResult![1];
  return Buffer.from(base64EncodedMap, 'base64').toString('utf8');
}

export function removeInlineSourceMap(source: string): string {
  return source.replace(getInlineSourceMapRegex(), '');
}

/**
 * Sets the source map inline in the file.  If there's an existing inline source
 * map, it clobbers it.
 */
export function setInlineSourceMap(source: string, sourceMap: string): string {
  const encodedSourceMap = Buffer.from(sourceMap, 'utf8').toString('base64');
  if (containsInlineSourceMap(source)) {
    return source.replace(
        getInlineSourceMapRegex(),
        `//# sourceMappingURL=data:application/json;base64,${encodedSourceMap}`);
  } else {
    return `${source}\n//# sourceMappingURL=data:application/json;base64,${encodedSourceMap}`;
  }
}

export function parseSourceMap(text: string, fileName?: string, sourceName?: string): RawSourceMap {
  const rawSourceMap = JSON.parse(text) as RawSourceMap;
  if (sourceName) {
    rawSourceMap.sources = [sourceName];
  }
  if (fileName) {
    rawSourceMap.file = fileName;
  }
  return rawSourceMap;
}

export function sourceMapConsumerToGenerator(sourceMapConsumer: SourceMapConsumer):
    SourceMapGenerator {
  return SourceMapGenerator.fromSourceMap(sourceMapConsumer);
}

/**
 * Tsc identifies source files by their relative path to the output file.  Since
 * there's no easy way to identify these relative paths when tsickle generates its
 * own source maps, we patch them with the file name from the tsc source maps
 * before composing them.
 */
export function sourceMapGeneratorToConsumer(
    sourceMapGenerator: SourceMapGenerator, fileName?: string,
    sourceName?: string): SourceMapConsumer {
  const rawSourceMap = sourceMapGenerator.toJSON();
  if (sourceName) {
    rawSourceMap.sources = [sourceName];
  }
  if (fileName) {
    rawSourceMap.file = fileName;
  }
  return new SourceMapConsumer(rawSourceMap);
}

export function sourceMapTextToConsumer(sourceMapText: string): BasicSourceMapConsumer {
  // the SourceMapConsumer constructor returns a BasicSourceMapConsumer or an
  // IndexedSourceMapConsumer depending on if you pass in a RawSourceMap or a
  // RawIndexMap or the string json of either.  In this case we're passing in
  // the string for a RawSourceMap, so we always get a BasicSourceMapConsumer
  return new SourceMapConsumer(sourceMapText) as BasicSourceMapConsumer;
}

export function sourceMapTextToGenerator(sourceMapText: string): SourceMapGenerator {
  return SourceMapGenerator.fromSourceMap(sourceMapTextToConsumer(sourceMapText));
}

/**
 * A position in a source map. All offsets are zero-based.
 */
export interface SourcePosition {
  /** 0 based */
  column: number;
  /** 0 based */
  line: number;
  /** 0 based full offset in the file. */
  position: number;
}

export interface SourceMapper {
  /**
   * Logically shift all source positions by `offset`.
   *
   * This method is useful if code has to prepend additional text to the generated output after
   * source mappings have already been generated. The source maps are then transparently adjusted
   * during TypeScript output generation.
   */
  shiftByOffset(offset: number): void;
  /**
   * Adds a mapping from `originalNode` in `original` position to its new location in the output,
   * spanning from `generated` (an offset in the file) for `length` characters.
   */
  addMapping(
      originalNode: ts.Node, original: SourcePosition, generated: SourcePosition,
      length: number): void;
}

export const NOOP_SOURCE_MAPPER: SourceMapper = {
  shiftByOffset() {/* no-op */},
  addMapping() {/* no-op */},
};
