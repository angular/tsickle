/**
 * @fileoverview Negative test: import type reports errors for conflicting symbols.
 */

import type {Type} from 'google3/path/to/multiple_provides/conflicting';

const z: Type = {x: 1};
console.log(z);