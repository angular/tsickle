/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as sourceMapUtils from '../src/source_map_utils';

const SOURCE_MAP_COMMENT = '//# sourceMappingURL=data:application/json;base64,';

describe('source map utils', () => {
  it('calculates the number of inline source maps', () => {
    const one = `${SOURCE_MAP_COMMENT}foo`;
    expect(sourceMapUtils.getInlineSourceMapCount(one)).toBe(1);

    const two = `${SOURCE_MAP_COMMENT}foo\n${SOURCE_MAP_COMMENT}bar`;
    expect(sourceMapUtils.getInlineSourceMapCount(two)).toBe(2);
  });

  it('extracts the last inline source map', () => {
    const foo = `${SOURCE_MAP_COMMENT}${encode('foo')}`;
    expect(sourceMapUtils.extractInlineSourceMap(foo)).toBe('foo');

    const foobar = `${SOURCE_MAP_COMMENT}${encode('foo')}\n${SOURCE_MAP_COMMENT}${encode('bar')}`;
    expect(sourceMapUtils.extractInlineSourceMap(foobar)).toBe('bar');

    const foobarbaz = `${SOURCE_MAP_COMMENT}${encode('foo')}\n` +
        `${SOURCE_MAP_COMMENT}${encode('bar')}\n` +
        `${SOURCE_MAP_COMMENT}${encode('baz')}`;
    expect(sourceMapUtils.extractInlineSourceMap(foobarbaz)).toBe('baz');
  });
});

function encode(s: string): string {
  return Buffer.from(s, 'utf8').toString('base64');
}
