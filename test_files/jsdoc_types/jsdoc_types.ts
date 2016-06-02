/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */

import * as module1 from './module1';
import {ClassOne} from './module2';
import {ClassOne as RenamedClassOne} from './module2';
import {ClassTwo as RenamedClassTwo} from './module2';

// Check that imported types get the proper names in JSDoc.
let x1 = new module1.Class();
let x2: module1.Interface = null;

// Should be refer to the names in module2.
let x3 = new ClassOne();
let x4 = new RenamedClassOne();
let x5 = new RenamedClassTwo();
