// This file imports exporter with a prefix import (* as ...), and then only
// uses the import in a type position.
// tsickle emits a goog.forwardDeclare for the type and uses it to refer to the
// type TypeExport.

import * as exporter from './exporter';

const someVar: exporter.TypeExport = 1;
console.log(someVar);
