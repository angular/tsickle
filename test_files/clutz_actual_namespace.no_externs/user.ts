/**
 * @fileoverview A user of the custom module.
 *
 * We expect the the output .js to to the module import via a
 * 'custom.module.name' goog.require.
 */

import {foo} from './module';

console.log(foo);
