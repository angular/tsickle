/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */

import * as module1 from './module1';
import {ClassOne} from './module2';
import {ClassOne as RenamedClassOne} from './module2';
import {ClassTwo as RenamedClassTwo} from './module2';

// Check that imported types get the proper names in JSDoc.
let /** @type {?} */ x1 = new module1.Class();
let /** @type {?} */ x2: module1.Interface = null;

// Should be refer to the names in module2.
let /** @type {?} */ x3 = new ClassOne();
let /** @type {?} */ x4 = new RenamedClassOne();
let /** @type {?} */ x5 = new RenamedClassTwo();
