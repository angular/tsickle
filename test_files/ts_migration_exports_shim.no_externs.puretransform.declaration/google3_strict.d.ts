/**
 * @fileoverview It's tricky to get the real google3_strict.d.ts file into the
 * tsickle golden tests, so we copy it here.
 */

declare namespace goog {
  /**
   * Allows reexporting TS module exports under an unrelated goog.module ID and
   * with a different layout.
   *
   * This function is only for temporary use in migrating to TS and can only be
   * used from within TS files. It is simply a marker for Tsickle to transform
   * the code. At runtime, no actual function will exist.
   *
   * See go/tsjs-migration-independent-javascript-imports
   */
  export function tsMigrationExportsShim(
      moduleId: string, exports: unknown): void;
}
