/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */

import * as module1 from './module1';

// Check that imported types get the proper names in JSDoc.
let /** @type {module1.Class} */ x1 = new module1.Class();
