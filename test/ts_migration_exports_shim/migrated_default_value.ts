/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Silence linter. */
export class DefaultExportClass {
  /**
   * Make sure this type is not structural or else downstream parts of the test
   * may pass due to accidental structural matches.
   */
  private readonly notStructural = undefined;

  /**
   * A function that we're 100% sure consumes this class, which we can use
   * to verify other types in downstream parts of the test.
   */
  static use(x: DefaultExportClass): void {}
}

// @ts-expect-error
DefaultExportClass.use(0);
DefaultExportClass.use(new DefaultExportClass());

/** See what happens when we use the syntax for shimming default exports. */
goog.tsMigrationExportsShim(
    'migrated.module.default.value', DefaultExportClass);
