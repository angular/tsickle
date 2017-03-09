/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */

import * as module1 from './module1';
import {ClassOne, value, ClassOne as RenamedClassOne, ClassTwo as RenamedClassTwo, Interface, ClassWithParams} from './module2';
const tsickle_forward_declare_1 = goog.forwardDeclare('test_files.jsdoc_types.module2');
import DefaultClass from './default';
const tsickle_forward_declare_2 = goog.forwardDeclare('test_files.jsdoc_types.default');
import {NeverTyped} from './nevertyped';
const tsickle_forward_declare_3 = goog.forwardDeclare('test_files.jsdoc_types.nevertyped');
goog.require('test_files.jsdoc_types.nevertyped'); // force type-only module to be loaded

// Check that imported types get the proper names in JSDoc.
let /** @type {!module1.Class} */ useNamespacedClass = new module1.Class();
let /** @type {!module1.Class} */ useNamespacedClassAsType: module1.Class;
let /** @type {!module1.Interface} */ useNamespacedType: module1.Interface;

// Should be references to the symbols in module2, perhaps via locals.
let /** @type {!tsickle_forward_declare_1.ClassOne} */ useLocalClass = new ClassOne();
let /** @type {!tsickle_forward_declare_1.ClassOne} */ useLocalClassRenamed = new RenamedClassOne();
let /** @type {!tsickle_forward_declare_1.ClassTwo} */ useLocalClassRenamedTwo = new RenamedClassTwo();
let /** @type {!tsickle_forward_declare_1.ClassOne} */ useLocalClassAsTypeRenamed: RenamedClassOne;
let /** @type {!tsickle_forward_declare_1.Interface} */ useLocalInterface: Interface;
let /** @type {!tsickle_forward_declare_1.ClassWithParams<number>} */ useClassWithParams: ClassWithParams<number>;

// This is purely a value; it doesn't need renaming.
let /** @type {number} */ useLocalValue = value;

// Check a default import.
let /** @type {!tsickle_forward_declare_2.default} */ useDefaultClass = new DefaultClass();
let /** @type {!tsickle_forward_declare_2.default} */ useDefaultClassAsType: DefaultClass;

// NeverTyped should be {?}, even in typed mode.
let /** @type {?} */ useNeverTyped: NeverTyped;
let /** @type {(string|?)} */ useNeverTyped2: string|NeverTyped;
/**
 * Note: no implements JSDoc clause because the type is blacklisted.
 */
class ImplementsNeverTyped implements NeverTyped {
  foo: number;
}

function ImplementsNeverTyped_tsickle_Closure_declarations() {
/** @type {number} */
ImplementsNeverTyped.prototype.foo;
}

