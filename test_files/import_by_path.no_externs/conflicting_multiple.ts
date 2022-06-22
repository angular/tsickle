/**
 * @fileoverview Negative test: this TS file attempts to import a JS module that
 * provides multiple conflicting namespaces by path, which is an error.
 * @suppress {checkTypes}
 */

import {value} from 'google3/path/to/multiple_provides/conflicting';
console.error(value);
