goog.module('closure.LegacyModule');
goog.module.declareLegacyNamespace();

const TransitiveType = goog.requireType('closure.TransitiveType');

class LocalClass {
  constructor() {
    /** @type {!TransitiveType} */
    this.property;
  }
}

exports.LegacyExport = LocalClass;
