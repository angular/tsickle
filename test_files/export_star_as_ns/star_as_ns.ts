/**
 * @fileoverview Tests exporting a namespace with a given name from Closure. This doesn't expand
 * each export like the `export * from '...'` syntax, so it's output just an assignment of the
 * imported module to a property on `exports`.
 */

export * as ns from './ns';
