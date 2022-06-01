/**
 * @fileoverview Tests various types of 'implements' clauses, e.g. 'implements'
 * of a generic type alias of an underlying interface.
 * @suppress {uselessCode}
 */

export {};

// RecordImpl implements a record.  This is illegal per Closure.
type MyRecord = {
  a: string
};
class RecordImpl implements MyRecord {
  a = 'a';
}

// Also try implementing the record via an alias.
type RecordAlias = MyRecord;
class RecordAliasImpl implements RecordAlias {
  a = 'a';
}


// InterfaceImpl implements a basic interface; @-interface should show up.
interface MyInterface {
  a: string;
}
class InterfaceImpl implements MyInterface {
  a = 'a';
}

// Class implements multiple interfaces.
interface MyOtherInterface {
  b: string;
}
class InterfaceMultipleImpl implements MyInterface, MyOtherInterface {
  a = 'a';
  b = 'b';
}

// InterfaceAliasImpl implements the same interface via an alias.
// We should inline through the alias.
type Alias = MyInterface;
class InterfaceAliasImpl implements Alias {
  a = 'a';
}

// GenericImpl implements a generic interface.
// We should pass the generic args through.
interface Generic<A, B> {
  a: A;
  b: B;
}
class GenericImpl implements Generic<string, number> {
  a = 'a';
  b = 1;
}

// GenericPartialImpl is a generic implementing a generic.
// The generic args should still make it.
class GenericPartialImpl<T> implements Generic<string, T> {
  a = 'a';
  b!: T;
}

// GenericIndirectImpl implements a generic via an indirection.
// Type aliases cannot be generic, so it will have a ? in it, but the
// implements clause will include the 'true' type.
type AliasGeneric<T> = Generic<string, T>;
class GenericIndirectImpl implements AliasGeneric<number> {
  a = 'a';
  b = 1;
}
