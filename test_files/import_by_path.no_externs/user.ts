/**
 * @fileoverview Tests that tsickle emits goog namespace references when
 * importing modules by path.
 * @suppress {checkTypes}
 */

import * as ns from 'google3/path/to/otherfile';
import {someFunction} from 'google3/path/to/otherfile';
import {SomeType} from 'google3/path/to/typeonly';

console.log(someFunction(1) as SomeType);
ns.someFunction(1);
