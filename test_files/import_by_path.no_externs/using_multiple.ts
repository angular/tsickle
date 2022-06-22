/**
 * @fileoverview Using a namespace that provides multiple, nested symbols.
 * @suppress {checkTypes}
 */

import {Nesting} from 'google3/path/to/multiple_provides/nesting';
console.error(new Nesting());
console.error(new Nesting.Inner());
