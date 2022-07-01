/**
 * @fileoverview Ensure transformed inner classes and enums can be
 * imported and used, and the types are properly annotated in the
 * JS output.
 */

import {SomeClass} from './inner_class';
import {e0, Outer} from './inner_enum';

const foo0 = e0();
function bar(e: Outer.Event) {
  return Outer.Event.E_1;
}

let inner: SomeClass.Inner;
