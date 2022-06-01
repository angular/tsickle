/**
 * @fileoverview This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 * @suppress {uselessCode}
 */

import DefaultClass from './default';
import * as module1 from './module1';
import {ClassOne, ClassOne as RenamedClassOne, ClassTwo as RenamedClassTwo, ClassWithParams, Interface, value} from './module2';
import {NeverTyped, NeverTypedTemplated} from './nevertyped';

// Check that imported types get the proper names in JSDoc.
let useNamespacedClass = new module1.Class();
let useNamespacedClassAsType: module1.Class;
let useNamespacedType: module1.Interface;

// Should be references to the symbols in module2, perhaps via locals.
let useLocalClass = new ClassOne();
let useLocalClassRenamed = new RenamedClassOne();
let useLocalClassRenamedTwo = new RenamedClassTwo();
let useLocalClassAsTypeRenamed: RenamedClassOne;
let useLocalInterface: Interface;
let useClassWithParams: ClassWithParams<number>;

// This is purely a value; it doesn't need renaming.
let useLocalValue = value;

// Check a default import.
let useDefaultClass = new DefaultClass();
let useDefaultClassAsType: DefaultClass;

// NeverTyped should be {?}, even in typed mode.
let useNeverTyped: NeverTyped;
let useNeverTyped2: string|NeverTyped;
let useNeverTypedTemplated: NeverTypedTemplated<string>;
/**
 * Note: JSDoc should not reference NeverTyped because the type is set to
 * always be unknown.
 */
class ImplementsNeverTyped implements NeverTyped {
  foo: number;
}
class ImplementsNeverTypedTemplated<T> implements NeverTypedTemplated<T> {
  foo: T;
}
