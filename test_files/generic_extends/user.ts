/**
 * @fileoverview Tests template parameters in extends clauses.
 * @suppress {uselessCode}
 */

type Key = 'a'|'b';

interface SomethingGeneric<T extends Key> {
  key: T;
}

// TODO: b/279145965 - Closure type annotation should emit generic type arg in
// extends clause.
interface SomethingExtendingSomethingGeneric<T extends Key> extends
    SomethingGeneric<T> {
  foo: unknown;
}
