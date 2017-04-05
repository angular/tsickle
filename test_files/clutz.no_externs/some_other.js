goog.module('some.other');

/** @record */
const ClutzedInterface = function() {};
/** @type {string} */
ClutzedInterface.prototype.field;

exports.ClutzedInterface = ClutzedInterface;

/** @typedef {ClutzedInterface} */
exports.TypeAlias;
