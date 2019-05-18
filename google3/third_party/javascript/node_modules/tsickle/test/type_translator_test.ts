/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as typeTranslator from '../src/type_translator';

describe('isBuiltinLibDTS', () => {
  it('matches builtins', () => {
    expect(typeTranslator.isBuiltinLibDTS('lib.d.ts')).toBe(true);
    expect(typeTranslator.isBuiltinLibDTS('lib.es6.d.ts')).toBe(true);
  });

  it('doesn\'t match others', () => {
    expect(typeTranslator.isBuiltinLibDTS('lib.ts')).toBe(false);
    expect(typeTranslator.isBuiltinLibDTS('libfoo.d.tts')).toBe(false);
    expect(typeTranslator.isBuiltinLibDTS('lib.a/b.d.tts')).toBe(false);
  });
});
