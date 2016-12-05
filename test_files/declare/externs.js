/**
 * @externs
 * @suppress {duplicate}
 */
// NOTE: generated by tsickle, do not edit.
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
 * @param {string} a
 * @return {number}
 */
DeclareTestModule.Foo.prototype.method = function(a) {};

/**
 * @constructor
 * @struct
 * @param {number} a
 */
DeclareTestModule.Clazz = function(a) {};

/**
 * Comment
 * @param {string} a
 * @return {number}
 */
DeclareTestModule.Clazz.prototype.method = function(a) {};

/** @record @struct */
DeclareTestModule.NotYetHandled = function() {};

/* TODO: IndexSignature: DeclareTestModule */

/** @const */
DeclareTestModule.Enumeration = {};
/** @const {number} */
DeclareTestModule.Enumeration.Value1;
/** @const {number} */
DeclareTestModule.Enumeration.Value3;

/** @const */
DeclareTestModule.StringEnum = {};
/** @const {number} */
DeclareTestModule.StringEnum.foo;

/* TODO: StringLiteral: '.tricky.invalid name' */

/** @typedef {(string|number)} */
DeclareTestModule.TypeAlias;
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

/**
 * @constructor
 * @struct
 * @param {number=} a
 */
function MultipleConstructors(a) {}

/**
 * @return {?}
 */
Object.prototype.myMethod = function() {};

/**
 * @param {string|number} x_or_y
 * @param {string=} x
 * @return {!CodeMirror.Editor}
 */
function CodeMirror(x_or_y, x) {}

/** @record @struct */
CodeMirror.Editor = function() {};
 /** @type {string} */
CodeMirror.Editor.prototype.name;

/** @record @struct */
function BareInterface() {}
 /** @type {string} */
BareInterface.prototype.name;

/**
 * @param {string} tsickle_arguments
 * @return {?}
 */
function usesArguments(tsickle_arguments) {}

/**
 * @param {?} __0
 * @return {?}
 */
function destructures(__0) {}
