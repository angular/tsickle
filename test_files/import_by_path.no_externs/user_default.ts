/**
 * @fileoverview Tests that tsickle emits goog namespace references when
 * importing modules by path, and handles named to default export conversion.
 * @suppress {checkTypes}
 */

import {MyClassDefaultExport} from 'google3/path/to/file';

console.log(new MyClassDefaultExport().someField);

// Make sure that type annotations get emitted correctly. The type annotation
// here must just refer to the module alias, without a ".MyClassDefaultExport".
const typeUsage = new MyClassDefaultExport();
console.log(typeUsage);
