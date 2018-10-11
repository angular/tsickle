// test_files/class/class.ts(44,1): warning TS0: omitting interface deriving from class: Class
// test_files/class/class.ts(52,1): warning TS0: omitting @implements of a class: Class
// test_files/class/class.ts(55,1): warning TS0: omitting @implements of a class: AbstractClass
// test_files/class/class.ts(76,1): warning TS0: omitting @implements of a class: Class
// test_files/class/class.ts(79,1): warning TS0: omitting @implements of a class: AbstractClass
// test_files/class/class.ts(98,1): warning TS0: omitting @implements of a class: Class
// test_files/class/class.ts(124,1): warning TS0: type/symbol conflict for Zone, using {?} for now
// test_files/class/class.ts(126,1): warning TS0: omitting heritage reference to a type/value conflict: Zone
// test_files/class/class.ts(130,1): warning TS0: omitting heritage reference to a type/value conflict: ZoneAlias
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
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
let interfaceExtendsInterface = {
    /**
     * @return {void}
     */
    interfaceFunc() { },
    /**
     * @return {void}
     */
    interfaceFunc2() { }
};
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
 * @implements {InexpressibleType}
 */
class ClassImplementsClass {
    /**
     * @return {void}
     */
    classFunc() { }
}
/**
 * @implements {InexpressibleType}
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
 * @implements {InexpressibleType}
 */
class AbstractClassImplementsClass {
    /**
     * @return {void}
     */
    classFunc() { }
}
/**
 * @abstract
 * @implements {InexpressibleType}
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
/**
 * @implements {Interface}
 * @implements {InexpressibleType}
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
// WARNING: interface has both a type and a value, skipping emit
/**
 * @return {void}
 */
function Zone() { }
/**
 * @implements {InexpressibleType}
 */
class ZoneImplementsInterface {
}
if (false) {
    /** @type {string} */
    ZoneImplementsInterface.prototype.zone;
}
/**
 * @implements {InexpressibleType}
 */
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
