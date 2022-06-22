/**
 * @fileoverview Negative test: import by star reports errors for conflicting
 * symbols.
 * @suppress {checkTypes}
 */

import * as prefix from 'google3/path/to/multiple_provides/conflicting';

console.log(prefix.value);
