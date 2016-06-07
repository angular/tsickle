goog.module('test_files.jsdoc_types.module2');var module = module || {id: 'test_files/jsdoc_types/module2.js'};
class ClassOne {
}
exports.ClassOne = ClassOne;
class ClassTwo {
}
exports.ClassTwo = ClassTwo;
/** @record */
function Interface() { }
exports.Interface = Interface;
/** @type {number} */
Interface.prototype.x;
exports.value = 3;
