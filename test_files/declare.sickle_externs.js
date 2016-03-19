/** @externs */
/** @const */
var DeclareTestModule = {};
/** @const */
DeclareTestModule.inner = {};
 /** @type { boolean} */
DeclareTestModule.inner.someBool;
/** @record @struct */
DeclareTestModule.Foo = function() {};
 /** @type { string} */
DeclareTestModule.Foo.prototype.field;

/**
 * @constructor
 * @struct
 * @param { number} a
 */
DeclareTestModule.Clazz = function(a) {};
 /** @type { number} */
DeclareTestModule.Clazz.prototype.field;
/** @record @struct */
DeclareTestModule.NotYetHandled = function() {};
 /** @type { number} */
var someGlobal;
/** @record @struct */
function DeclareTestInterface() {}
 /** @type { string} */
DeclareTestInterface.prototype.foo;
