// test_files/class/class.ts(44,1): warning TS0: omitting interface deriving from class: Class
// test_files/class/class.ts(128,1): warning TS0: omitting heritage reference to a type/value conflict: Zone
// test_files/class/class.ts(132,1): warning TS0: omitting heritage reference to a type/value conflict: ZoneAlias
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// This test exercises the various ways classes and interfaces can interact.
// There are three types of classy things:
//   interface, class, abstract class
// And there are two keywords for relating them:
//   extends, implements
// You can legally use them in almost any configuration the cross product implies;
// for example, you can "implements" a class though it's more rare than the
// other options.
goog.module('test_files.class.class');
var module = module || { id: 'test_files/class/class.ts' };
module = module;
exports = {};
/**
 * @record
 */
function Interface() { }
if (false) {
    /**
     * @return {void}
     */
    Interface.prototype.interfaceFunc = function () { };
}
class Class {
    /**
     * @return {void}
     */
    classFunc() { }
}
/**
 * @abstract
 */
class AbstractClass {
    /**
     * @return {void}
     */
    nonAbstractFunc() { }
}
if (false) {
    /**
     * @abstract
     * @return {void}
     */
    AbstractClass.prototype.abstractFunc = function () { };
}
/**
 * @record
 * @extends {Interface}
 */
function InterfaceExtendsInterface() { }
if (false) {
    /**
     * @return {void}
     */
    InterfaceExtendsInterface.prototype.interfaceFunc2 = function () { };
}
/** @type {!InterfaceExtendsInterface} */
let interfaceExtendsInterface = { /**
     * @return {void}
     */
    interfaceFunc() { }, /**
     * @return {void}
     */
    interfaceFunc2() { } };
/**
 * @record
 */
function InterfaceExtendsClass() { }
if (false) {
    /**
     * @return {void}
     */
    InterfaceExtendsClass.prototype.interfaceFunc3 = function () { };
}
// Permutation 3: class implements.
/**
 * @implements {Interface}
 */
class ClassImplementsInterface {
    /**
     * @return {void}
     */
    interfaceFunc() { }
}
/**
 * @extends {Class}
 */
class ClassImplementsClass {
    /**
     * @return {void}
     */
    classFunc() { }
}
/**
 * @extends {AbstractClass}
 */
class ClassImplementsAbstractClass {
    /**
     * @return {void}
     */
    abstractFunc() { }
    // Note: because this class *implements* AbstractClass, it must also implement
    // nonAbstractFunc despite that already having an implementation.
    /**
     * @return {void}
     */
    nonAbstractFunc() { }
}
// Permutation 4: class extends.
// Note: cannot "extends" an interface.
// So this is illegal: class ClassExtendsInterface extends Interface {
class ClassExtendsClass extends Class {
    /**
     * @return {void}
     */
    classFunc() { }
}
class ClassExtendsAbstractClass extends AbstractClass {
    /**
     * @return {void}
     */
    abstractFunc() { }
}
// Permutation 5: abstract class implements.
/**
 * @abstract
 * @implements {Interface}
 */
class AbstractClassImplementsInterface {
    /**
     * @return {void}
     */
    interfaceFunc() { }
}
/**
 * @abstract
 * @extends {Class}
 */
class AbstractClassImplementsClass {
    /**
     * @return {void}
     */
    classFunc() { }
}
/**
 * @abstract
 * @extends {AbstractClass}
 */
class AbstractClassImplementsAbstractClass {
    // Note: because this class *implements* AbstractClass, it must also implement
    // abstractFunc and nonAbstractFunc despite that already having an implementation.
    /**
     * @return {void}
     */
    abstractFunc() { }
    /**
     * @return {void}
     */
    nonAbstractFunc() { }
}
// Permutation 6: abstract class extends.
// Note: cannot "extends" an interface.
// So this is illegal: class AbstractClassExtendsInterface extends Interface {
/**
 * @abstract
 */
class AbstractClassExtendsClass extends Class {
    /**
     * @return {void}
     */
    classFunc() { }
}
/**
 * @abstract
 */
class AbstractClassExtendsAbstractClass extends AbstractClass {
}
/** @typedef {!Interface} */
var TypeAlias;
/**
 * @implements {Interface}
 * @extends {Class}
 */
class ImplementsTypeAlias {
    /**
     * @return {void}
     */
    interfaceFunc() { }
    /**
     * @return {void}
     */
    classFunc() { }
}
// Verify Closure accepts the various subtypes of Interface.
/** @type {!Interface} */
let interfaceVar;
interfaceVar = interfaceExtendsInterface;
interfaceVar = new ClassImplementsInterface();
interfaceVar = new ImplementsTypeAlias();
// Verify Closure accepts the various subtypes of Class.
/** @type {!Class} */
let classVar;
classVar = new ClassImplementsClass();
classVar = new ClassExtendsClass();
classVar = new ImplementsTypeAlias();
// Verify Closure accepts the various subtypes of AbstractClass.
/** @type {!AbstractClass} */
let abstractClassVar;
abstractClassVar = new ClassImplementsAbstractClass();
abstractClassVar = new ClassExtendsAbstractClass();
/**
 * @record
 * tsickle: symbol renamed to avoid type/value conflict
 */
function Zone$$TSType() { }
if (false) {
    /** @type {string} */
    Zone$$TSType.prototype.zone;
}
/**
 * @return {void}
 */
function Zone() { }
class ZoneImplementsInterface {
}
if (false) {
    /** @type {string} */
    ZoneImplementsInterface.prototype.zone;
}
/** @typedef {!Zone$$TSType} */
var ZoneAlias;
class ZoneImplementsAlias {
}
if (false) {
    /** @type {string} */
    ZoneImplementsAlias.prototype.zone;
}
class WithOptionalField {
    constructor() {
        this.optionalField = 'a';
    }
}
if (false) {
    /** @type {(undefined|string)} */
    WithOptionalField.prototype.optionalField;
}
