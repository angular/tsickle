/**
 * @fileoverview This test verifies that a type/value-conflict symbol that
 * occurs in a clutz file still can be used in a heritage clause.
 * @suppress {uselessCode}
 */

import IFace from 'goog:type_value';

// We expect IFace to show up in the @implements tag.
class C implements IFace {
  field = 'abc';
}

// We expect IFace to show up in the @type of usingTypeValueConflictType below.
const usingTypeValueConflictType: IFace|null = null;
