/** @externs */
/** @const */
var DeclareTestModule = {};
/** @const */
DeclareTestModule.inner = {};
 /** @type {boolean} */
DeclareTestModule.inner.someBool;
/** @record @struct */
DeclareTestModule.Foo = function() {};
 /** @type {string} */
DeclareTestModule.Foo.prototype.field;

/**
 * @constructor
 * @struct
 * @param {number} a
 */
DeclareTestModule.Clazz = function(a) {};

/**
 *  Comment
 * @param {string} a
 * @return {number}
 */
DeclareTestModule.Clazz.prototype.method = function(a) {};
/** @record @struct */
DeclareTestModule.NotYetHandled = function() {};
 /** @type {number} */
var declareGlobalVar;

/**
 * @param {string} x
 * @return {number}
 */
function declareGlobalFunction(x) {}
/** @record @struct */
function DeclareTestInterface() {}
 /** @type {string} */
DeclareTestInterface.prototype.foo;
