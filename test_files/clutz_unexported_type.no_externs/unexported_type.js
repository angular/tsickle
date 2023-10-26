goog.module('unexported_type');

class LocalClass {
  constructor() {
    /** @private {string} */
    this.field;
  }
}

/** @return {!LocalClass} */
function fn() {
  return new LocalClass();
}

exports = {fn};
