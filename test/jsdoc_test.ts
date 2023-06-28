/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as jsdoc from '../src/jsdoc';

describe('jsdoc.parse', () => {
  function parse(text: string) {
    const synth = jsdoc.getLeadingCommentRangesSynthesized(text);
    return jsdoc.parse(synth[0]);
  }

  it('does not get non-jsdoc values', () => {
    const source = '/* ordinary comment */';
    expect(parse(source)).toEqual(null);
  });
  it('grabs plain text from jsdoc', () => {
    const source = '/** jsdoc comment */';
    expect(parse(source)).toEqual({tags: [{tagName: '', text: 'jsdoc comment'}]});
  });
  it('gathers @tags from jsdoc', () => {
    const source = `/**
  * @param foo
  *   @param indented from line start.
  * @param bar multiple
  *    line comment
  * @return foobar
  * @nosideeffects
  * @nospacebeforebracket{text in bracket}
  */`;
    expect(parse(source)).toEqual({
      tags: [
        {tagName: 'param', parameterName: 'foo'},
        {tagName: 'param', parameterName: 'indented', text: 'from line start.'},
        {
          tagName: 'param',
          parameterName: 'bar',
          text: 'multiple\n   line comment'
        },
        {tagName: 'return', text: 'foobar'},
        {tagName: 'nosideeffects'},
        {tagName: 'nospacebeforebracket', text: '{text in bracket}'},
      ]
    });
  });
  it('warns on type annotations in parameters', () => {
    const source = `/**
  * @param {string} foo
*/`;
    expect(parse(source)).toEqual({
      tags: [],
      warnings: [
        'the type annotation on @param is redundant with its TypeScript type, remove the {...} part'
      ]
    });
  });
  it('warns on @type annotations', () => {
    const source = `/** @type {string} foo */`;
    expect(parse(source)).toEqual({
      tags: [],
      warnings: ['@type annotations are redundant with TypeScript equivalents']
    });
  });
  it('allows @suppress annotations', () => {
    const source = `/** @suppress {checkTypes} I hate types */`;
    expect(parse(source)).toEqual({
      tags: [{tagName: 'suppress', type: 'checkTypes', text: ' I hate types'}]
    });
    const malformed = `/** @suppress malformed */`;
    expect(parse(malformed)).toEqual({
      tags: [{tagName: 'suppress', text: 'malformed'}],
      warnings: ['malformed @suppress tag: "malformed"'],
    });
  });
});

describe('jsdoc.toString', () => {
  it('filters duplicated @deprecated tags', () => {
    expect(jsdoc.toString([
      {tagName: 'deprecated'}, {tagName: 'param', parameterName: 'hello', text: 'world'},
      {tagName: 'deprecated'}
    ])).toBe(`/**
 * @deprecated
 * @param hello world
 */
`);
  });

  it('escapes @argument tags', () => {
    expect(jsdoc.toString([
      {tagName: 'argument', parameterName: 'hello', text: 'world'},
    ])).toBe(`/**
 * \\@argument hello world
 */
`);
  });
});
