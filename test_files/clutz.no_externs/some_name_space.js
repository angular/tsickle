goog.module('some.name.space');

const other = goog.require('some.other');

exports.ClutzedClass = class {
  constructor() { /** @type {!other.TypeAlias} */ this.field; }
};
/** @param {!other.TypeAlias} param a param. */
exports.clutzedFn = function(param) {};
