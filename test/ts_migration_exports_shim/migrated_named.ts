/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Silence linter. */
export class NamedExportClass {
  /**
   * Make sure this type is not structural or else downstream parts of the test
   * may pass due to accidental structural matches.
   */
  private readonly notStructural = undefined;

  /**
   * A function that we're 100% sure consumes this class, which we can use
   * to verify other types in downstream parts of the test.
   */
  static use(x: NamedExportClass): void {}
}

export interface ExportedType {
  shouldBeANumber: number;
  someMethod: (x: ExportedType) => void;
}

/** See what happens when we use the syntax for shimming named exports. */
goog.tsMigrationExportsShim('migrated.module.named', {
  NamedExportClassRenamed: NamedExportClass,
  RenamedExportedType: {} as ExportedType,
});
