goog.module('type_value');

/** @record */
class IFace {
  constructor() {
    /** @type {string} */
    this.field;
  }
}

class Class {
  constructor() {
    /** @type {string} */
    this.otherField;
  }
}

IFace.Class = Class;

exports = IFace;
