/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */

import * as module1 from './module1';
import {ClassOne, value, ClassOne as RenamedClassOne, ClassTwo as RenamedClassTwo, Interface, ClassWithParams} from './module2';
const ClassOne: NeverTypeCheckMe = ClassOne;  /* local alias for Closure JSDoc */
const value: NeverTypeCheckMe = value;  /* local alias for Closure JSDoc */
const RenamedClassOne: NeverTypeCheckMe = RenamedClassOne;  /* local alias for Closure JSDoc */
const RenamedClassTwo: NeverTypeCheckMe = RenamedClassTwo;  /* local alias for Closure JSDoc */
const Interface: NeverTypeCheckMe = Interface;  /* local alias for Closure JSDoc */
const ClassWithParams: NeverTypeCheckMe = ClassWithParams;  /* local alias for Closure JSDoc */
import DefaultClass from './default';
const DefaultClass: NeverTypeCheckMe = DefaultClass;  /* local alias for Closure JSDoc */
import {NeverTyped} from './nevertyped';
const NeverTyped: NeverTypeCheckMe = NeverTyped;  /* local alias for Closure JSDoc */

// Check that imported types get the proper names in JSDoc.
let /** @type {!module1.Class} */ useNamespacedClass = new module1.Class();
let /** @type {!module1.Class} */ useNamespacedClassAsType: module1.Class;
let /** @type {!module1.Interface} */ useNamespacedType: module1.Interface;

// Should be references to the symbols in module2, perhaps via locals.
let /** @type {!ClassOne} */ useLocalClass = new ClassOne();
let /** @type {!ClassOne} */ useLocalClassRenamed = new RenamedClassOne();
let /** @type {!RenamedClassTwo} */ useLocalClassRenamedTwo = new RenamedClassTwo();
let /** @type {!ClassOne} */ useLocalClassAsTypeRenamed: RenamedClassOne;
let /** @type {!Interface} */ useLocalInterface: Interface;
let /** @type {!ClassWithParams<number>} */ useClassWithParams: ClassWithParams<number>;

// This is purely a value; it doesn't need renaming.
let /** @type {number} */ useLocalValue = value;

// Check a default import.
let /** @type {!DefaultClass} */ useDefaultClass = new DefaultClass();
let /** @type {!DefaultClass} */ useDefaultClassAsType: DefaultClass;

// NeverTyped should be {?}, even in typed mode.
let /** @type {?} */ useNeverTyped: NeverTyped;
let /** @type {(string|?)} */ useNeverTyped2: string|NeverTyped;
