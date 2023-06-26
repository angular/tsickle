/**
 * When gbigint is made globally available, this file will be
 * deleted as the typings here will move to a global location. At this moment,
 * the proposed location is:
 * google3/javascript/externs/google_legacy.js
 * @externs
 */

/**
 * See go/gbigint.
 *
 * Opaque value type that represents `bigint` values regardless of native
 * platform support for `bigint`. As value types, they have a guaranteed
 * consistent runtime representation compatible with `===`, ES6 `Map` keys and
 * `Set` values.
 * @interface
 */
function gbigint() {}

/** @const {symbol} */
gbigint.prototype.__doNotManuallySet;
