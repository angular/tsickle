/**
 * @fileoverview Tests that initialized variables that end up untyped (`?`) do not get an explicit
 * type annotation, so that Closure's type inference can kick in and possibly do a better job.
 */

import {NeverTyped} from '../jsdoc_types/nevertyped';

// This should not have a type annotation.
const initializedUntyped: NeverTyped = {
  foo: 1
};

// This should have a type annotation as the variable is not initialized.
// tslint:disable-next-line:prefer-const
let uninitializedUntyped: NeverTyped;
