/**
 * @fileoverview This test deals with symbols that are simultaneously types and
 * values.
 * @suppress {checkTypes,uselessCode}
 */
import * as conflict from './module';

// Use a browser built-in as both a type and a value.
let useBuiltInAsValue = Document;
let useBuiltInAsType: Document;

// Augment a browser built-in, then do the same again.
declare global {
  interface Node {
    extra: string
  }
}
let useAugmentAsValue = Node;
let useAugmentAsType: Node;

// Use a user-defined class as both a type and a value.
let useUserClassAsValue = conflict.Class;
let useUserClassAsType: conflict.Class;

let useEnumAsValue = conflict.Enum;
let useEnumAsType: conflict.Enum;

// Use a user-defined interface/value pair as both a type and a value.
let useAsValue = conflict.TypeAndValue;
// Note: because of the conflict, we currently just use the type {?} here.
let useAsType: conflict.TypeAndValue;

// Use a templatized user-defined interface/value pair as a type.
let useAsTypeTemplatized: conflict.TemplatizedTypeAndValue<string>;

// Construct a conflict between the module import and a type.
// We should not emit the type in that case.
type conflict = string;

// Use the extern-defined types, found in typing.d.ts.
let extUseAsType: ExtTypeAndValue;
let extUseAsValue = ExtTypeAndValue;

let extUseEnumAsValue = ExtEnum;
let extUseEnumAsType: ExtEnum;

// ImplementsTypeAndValue implements a symbol that resolves to both a type and a
// value, and thus the @implements clause is dropped by tsickle.
class ImplementsTypeAndValue implements conflict.TypeAndValue {
  z = 1;
}
/**
 * ImplementsTypeAndValueBuiltin implements Boolean, which is both a type and a
 * value in the lib.d.ts. However we special case lib.d.ts builtins, and thus do
 * emit the implements clause.
 */
export class ImplementsTypeAndValueBuiltin implements Boolean {
  valueOf(): boolean {
    return false;  // grumpycat
  }
}
