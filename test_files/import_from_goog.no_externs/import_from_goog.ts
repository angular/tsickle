/**
 * @fileoverview
 */

import LocalName from 'goog:closure.Module';
// tslint:disable-next-line:no-unused-variable
import {SymA, SymB} from 'goog:closure.OtherModule';
import {LegacyExport} from 'goog:closure.LegacyModule';

// Make sure that default imports from goog: modules are emitted as just the
// module symbol, without a ".default" property.
// tslint:disable-next-line:no-inferrable-new-expression
const x: LocalName = new LocalName();
let y: SymA;
let z: LegacyExport;
function f(legacyExport: LegacyExport) {
  return legacyExport.property;
}
