/**
 * @fileoverview negative tests for the tsMigrationExportsShim transformation.
 */

export const exported = 1;
export const nested = {
  X: 1
};

const notExported = 1;

goog.tsMigrationExportsShim('bad.exports', {
  notExported,
  method() {
    return 1;
  },
  nested: {exported},
  navigated: nested.X,
});

goog.tsMigrationExportsShim('only.one.allowed', exported);

function f() {
  goog.tsMigrationExportsShim('must.be.top.level', {});
}
