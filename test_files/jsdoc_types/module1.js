goog.module('test_files.jsdoc_types.module1');var module = module || {id: 'test_files/jsdoc_types/module1.js'};
/**
 * @unrestricted
 */
class Class {
}
exports.Class = Class;
/** @record */
function Interface() { }
exports.Interface = Interface;
/** @type {number} */
Interface.prototype.x;
