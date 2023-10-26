/**
 * Opaque value type that represents big integer values regardless of native
 * platform support for `bigint`. See go/gbigint for more info.
 */
interface gbigint {
  readonly __doNotManuallySet: unique symbol;

  valueOf(): gbigint;
}
