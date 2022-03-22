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

  /**
   * Allows reexporting a TS module's one and only export under an unrelated
   * goog.module ID, making it available as an unnamed export in JavaScript.
   *
   * vis. This TypeScript in a file named `foo/bar/path.ts`
   *
   * ```
   * export const Foo = 42;
   * goog.tsMigrationDefaultExportsShim('some.other.module.name');
   * ```
   *
   * generates this shim in JavaScript:
   *
   * ```
   * goog.module('some.other.module.name');
   * const { Foo } = goog.require('foo.bar.path');
   * exports = Foo;
   * ```
   *
   * This function is only for temporary use in migrating to TS and can only be
   * used from within TS files. It is simply a marker for Tsickle to transform
   * the code. At runtime, no actual function will exist.
   *
   * See go/tsjs-migration-independent-javascript-imports
   */
  export function tsMigrationDefaultExportsShim(moduleId: string): void;

  /**
   * Allows reexporting all of a TS module's exports under an unrelated
   * goog.module ID, making them all available as a named exports in JavaScript.
   *
   * vis. This TypeScript in a file named `foo/bar/path.ts`
   *
   * ```
   * export const Foo = 42;
   * export class C {}
   * export interface I {}
   * goog.tsMigrationNamedExportsShim('some.other.module.name');
   * ```
   *
   * generates this shim in JavaScript:
   *
   * ```
   * goog.module('some.other.module.name');
   * const { Foo, C, I } = goog.require('foo.bar.path');
   * exports.Foo = Foo;
   * exports.C = C;
   * exports.I = I;
   * ```
   *
   * This function is only for temporary use in migrating to TS and can only be
   * used from within TS files. It is simply a marker for Tsickle to transform
   * the code. At runtime, no actual function will exist.
   *
   * See go/tsjs-migration-independent-javascript-imports
   */
  export function tsMigrationNamedExportsShim(moduleId: string): void;

  /**
   * Works in conjunction with the previous TS Migration Exports Shim methods to
   * indicate the exported goog.module ID should also be made available as per
   * `goog.module.declareLegacyNamespace`.
   */
  export function tsMigrationExportsShimDeclareLegacyNamespace(): void;
}
