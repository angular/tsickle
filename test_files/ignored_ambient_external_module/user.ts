/**
 * @fileoverview Regression test for type-ignored ambient modules.
 * @suppress {uselessCode}
 */

// This import must not be emitted, not even as a
// goog.requireType/forwardDeclare.
import {Ambient} from 'ambient-external-module-ignored';

export class User {
  // This field should be emitted with a ? type.
  field: Ambient|null;

  constructor() {
    this.field = null;
  }
}
