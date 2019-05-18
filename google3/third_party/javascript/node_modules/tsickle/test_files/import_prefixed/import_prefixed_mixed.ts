// This file imports exporter with a prefix import (* as ...), and then uses the
// import in a type and in a value position.

import * as exporter from './exporter';

let someVar: exporter.TypeExport;
console.log(exporter.valueExport);
