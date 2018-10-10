/** @fileoverview Tests that renamed exported symbols are referenced with they renamed name. */

import {RenamedExport} from './exporter';

// This declaration must use RenamedExport as its name, not
const usesRenamedExport: RenamedExport|null = null;
console.log(usesRenamedExport);
