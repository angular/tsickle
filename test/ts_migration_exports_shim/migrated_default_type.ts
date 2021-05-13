/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Silence linter. */
export interface DefaultExportType {
  shouldBeANumber: number;
  someMethod: (x: DefaultExportType) => void;
}

const a: DefaultExportType = {
  // @ts-expect-error
  shouldBeANumber: 'foo',
};

const b: DefaultExportType = {
  shouldBeANumber: 42,
  someMethod: (x: DefaultExportType) => {},
};

/** See what happens when we use the syntax for shimming default exports. */
goog.tsMigrationExportsShim(
    'migrated.module.default.type', {} as DefaultExportType);
