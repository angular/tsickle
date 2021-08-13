/**
 * @fileoverview negative tests for the tsMigrationExportsShim transformation.
 *
 * Suppress expected errors for :test_files_compilation_test
 * @suppress {checkTypes,visibility}
 */

export const exported = 1;
export const nested = {
  X: 1
};

const notExported = 1;

export interface AnInterface {
  shouldBeANumber: number;
}

interface NotAnExportedInterface {
  shouldBeAString: string
}

goog.tsMigrationExportsShim('bad.exports', {
  notExported,
  method() {
    return 1;
  },
  nested: {exported},
  navigated: nested.X,
  foo: {} as AnInterface,
  bar: {} as NotAnExportedInterface,
});

goog.tsMigrationExportsShim('only.one.allowed', exported);

function f() {
  goog.tsMigrationExportsShim('must.be.top.level', {});
}
