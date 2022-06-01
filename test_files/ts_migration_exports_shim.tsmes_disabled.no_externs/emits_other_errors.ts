/**
 * @fileoverview negative tests for the tsMigrationExportsShim transformation.
 *
 * Suppress expected errors for :test_files_compilation_test
 * @suppress {checkTypes,uselessCode,visibility}
 */

// Allowed to be exported by tsmes.
export const exported = 1;

// Allowed to be exported by tsmes.
export const nested = {
  // Cannot be exported by tsmes.
  X: 1
};

// Cannot be exported by tsmes.
const notExported = 1;

// Allowed to be exported by tsmes.
export interface AnInterface {
  shouldBeANumber: number;
}

// Cannot be exported by tsmes.
interface AnInterfaceNotExported {
  shouldBeAString: string;
}

export type TemplateType<T> = T;

const NotAnObjectLiteral: any = 'bloop';

// Only module-level exports can be exported by tsmes
goog.tsMigrationExportsShim('bad.exports', {
  // This symbol is not exported
  notExported,
  // Method declarations are not module-level exports
  method() {
    return 1;
  },
  // Properties are not module-level exports
  nested: {exported},
  // Properties are not module-level exports
  navigated: nested.X,
  // This should be allowed
  foo: {} as AnInterface,
  // This symbol is not exported
  bar: {} as AnInterfaceNotExported,
  bloop: NotAnObjectLiteral as AnInterface,
  templateType: {} as TemplateType<string>,
  objectLiteralType: {} as {
    someProperty: 'somevalue'
  }
});

// Only 0-1 tsmes calls are allowed per-module
goog.tsMigrationExportsShim('only.one.allowed', exported);

function f() {
  // tsmes calls must be module-level
  goog.tsMigrationExportsShim('must.be.top.level', {});
}
