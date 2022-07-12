"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const typeTranslator = require("../src/type_translator");
describe('isBuiltinLibDTS', () => {
    it('matches builtins', () => {
        expect(typeTranslator.isDeclaredInBuiltinLibDTS(createNodeInSourceFile('lib.d.ts')))
            .toBe(true);
        expect(typeTranslator.isDeclaredInBuiltinLibDTS(createNodeInSourceFile('lib.es6.d.ts')))
            .toBe(true);
    });
    it('doesn\'t match others', () => {
        expect(typeTranslator.isDeclaredInBuiltinLibDTS(createNodeInSourceFile('lib.ts')))
            .toBe(false);
        expect(typeTranslator.isDeclaredInBuiltinLibDTS(createNodeInSourceFile('libfoo.d.tts')))
            .toBe(false);
        expect(typeTranslator.isDeclaredInBuiltinLibDTS(createNodeInSourceFile('lib.a/b.d.tts')))
            .toBe(false);
    });
});
function createNodeInSourceFile(sourceFileName) {
    const sF = ts.createSourceFile(sourceFileName, `export const a = 'hello world';`, ts.ScriptTarget.ES5);
    return sF.getChildAt(0);
}
//# sourceMappingURL=type_translator_test.js.map