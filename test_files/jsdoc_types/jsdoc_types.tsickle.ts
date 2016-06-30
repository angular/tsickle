/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */

import * as module1 from './module1';
import {ClassOne as tsickle_ClassOne,value,} from './module2';
const ClassOne = tsickle_ClassOne;
type ClassOne = tsickle_ClassOne;

import {ClassOne as tsickle_RenamedClassOne,} from './module2';
const RenamedClassOne = tsickle_RenamedClassOne;
type RenamedClassOne = tsickle_RenamedClassOne;

import {ClassTwo as tsickle_RenamedClassTwo,} from './module2';
const RenamedClassTwo = tsickle_RenamedClassTwo;
type RenamedClassTwo = tsickle_RenamedClassTwo;

import {Interface as tsickle_Interface,} from './module2';
declare var tsickle_Interface: any;
const Interface = tsickle_Interface;
type Interface = tsickle_Interface;

import {ClassWithParams as tsickle_ClassWithParams,} from './module2';
const ClassWithParams = tsickle_ClassWithParams;
type ClassWithParams<T0> = tsickle_ClassWithParams<T0>;

import tsickle_DefaultClass from './default';
const DefaultClass = tsickle_DefaultClass;
type DefaultClass = tsickle_DefaultClass;

import {NeverTyped as tsickle_NeverTyped,} from './nevertyped';
declare var tsickle_NeverTyped: any;
const NeverTyped = tsickle_NeverTyped;
type NeverTyped = tsickle_NeverTyped;


// Check that imported types get the proper names in JSDoc.
let /** @type {module1.Class} */ useNamespacedClass = new module1.Class();
let /** @type {module1.Class} */ useNamespacedClassAsType: module1.Class = null;
let /** @type {module1.Interface} */ useNamespacedType: module1.Interface = null;

// Should be references to the symbols in module2, perhaps via locals.
let /** @type {ClassOne} */ useLocalClass = new ClassOne();
let /** @type {ClassOne} */ useLocalClassRenamed = new RenamedClassOne();
let /** @type {RenamedClassTwo} */ useLocalClassRenamedTwo = new RenamedClassTwo();
let /** @type {ClassOne} */ useLocalClassAsTypeRenamed: RenamedClassOne = null;
let /** @type {Interface} */ useLocalInterface: Interface = null;
let /** @type {ClassWithParams<number>} */ useClassWithParams: ClassWithParams<number> = null;

// This is purely a value; it doesn't need renaming.
let /** @type {number} */ useLocalValue = value;

// Check a default import.
let /** @type {DefaultClass} */ useDefaultClass = new DefaultClass();
let /** @type {DefaultClass} */ useDefaultClassAsType: DefaultClass = null;

// NeverTyped should be {?}, even in typed mode.
let /** @type {?} */ useNeverTyped: NeverTyped = null;
let /** @type {(string|?)} */ useNeverTyped2: string|NeverTyped = null;
