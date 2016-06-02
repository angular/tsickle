/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */

import * as module1 from './module1';
import {ClassOne as tsickle_ClassOne,} from './module2';
const ClassOne = tsickle_ClassOne;

import {ClassOne as tsickle_RenamedClassOne,} from './module2';
const RenamedClassOne = tsickle_RenamedClassOne;

import {ClassTwo as tsickle_RenamedClassTwo,} from './module2';
const RenamedClassTwo = tsickle_RenamedClassTwo;


// Check that imported types get the proper names in JSDoc.
let /** @type {module1.Class} */ x1 = new module1.Class();
let /** @type {module1.Interface} */ x2: module1.Interface = null;

// Should be refer to the names in module2.
let /** @type {ClassOne} */ x3 = new ClassOne();
let /** @type {ClassOne} */ x4 = new RenamedClassOne();
let /** @type {RenamedClassTwo} */ x5 = new RenamedClassTwo();
