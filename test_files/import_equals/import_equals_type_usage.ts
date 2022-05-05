/**
 * @fileoverview Tests type only usage of symbols imported using import equals
 * syntax. TypeScript elides those imports, so type references have to use
 * tsickle's requireType symbols.
 */

import {Exported} from './exporter';

import Nested = Exported.Nested;
import Thing = Exported.Nested.Thing;

let exported: Exported|undefined;
let nested: Nested|undefined;
let thing: Thing|undefined;

console.log(exported, nested, thing);
