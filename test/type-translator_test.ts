import {expect} from 'chai';

import * as type_translator from '../src/type-translator';

describe('isBuiltinLibDTS', () => {
  it('matches builtins', () => {
    expect(type_translator.isBuiltinLibDTS('lib.d.ts')).to.equal(true);
    expect(type_translator.isBuiltinLibDTS('lib.es6.d.ts')).to.equal(true);
  });

  it('doesn\'t match others', () => {
    expect(type_translator.isBuiltinLibDTS('lib.ts')).to.equal(false);
    expect(type_translator.isBuiltinLibDTS('libfoo.d.tts')).to.equal(false);
    expect(type_translator.isBuiltinLibDTS('lib.a/b.d.tts')).to.equal(false);
  });
});
