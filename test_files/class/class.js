// test_files/class/class.ts(47,1): warning TS0: dropped extends: interface cannot extend/implement class
// test_files/class/class.ts(128,1): warning TS0: type/symbol conflict for Zone, using {?} for now
// test_files/class/class.ts(132,42): warning TS0: type/symbol conflict for Zone, using {?} for now
// test_files/class/class.ts(132,1): warning TS0: dropped implements: {?} type
// test_files/class/class.ts(135,1): warning TS0: type/symbol conflict for Zone, using {?} for now
// test_files/class/class.ts(136,38): warning TS0: type/symbol conflict for Zone, using {?} for now
// test_files/class/class.ts(136,1): warning TS0: dropped implements: {?} type
/**
 *
 * @fileoverview This test exercises the various ways classes and interfaces can
 * interact. There are three types of classy things: interface, class, abstract
 * class And there are two keywords for relating them: extends, implements You
 * can legally use them in almost any configuration the cross product implies;
 * for example, you can "implements" a class though it's more rare than the
 * other options.
 * Generated from: test_files/class/class.ts
 * @suppress {uselessCode}
 * @suppress {dangerousUnrecognizedTypeError}
 *
 */
goog.module('test_files.class.class');
var module = module || { id: 'test_files/class/class.ts' };
goog.require('tslib');
/**
 * @record
 */
function Interface() { }
/* istanbul ignore if */
if (false) {
    /**
     * @public
     * @return {void}
     */
    Interface.prototype.interfaceFunc = function () { };
}
class Class {
    /**
     * @public
     * @return {void}
     */
    classFunc() { }
}
/**
 * @abstract
 */
class AbstractClass {
    /**
     * @public
     * @return {void}
     */
    nonAbstractFunc() { }
}
/* istanbul ignore if */
if (false) {
    /**
     * @abstract
     * @public
     * @return {void}
     */
    AbstractClass.prototype.abstractFunc = function () { };
}
/**
 * @record
 * @extends {Interface}
 */
function InterfaceExtendsInterface() { }
/* istanbul ignore if */
if (false) {
    /**
     * @public
     * @return {void}
     */
    InterfaceExtendsInterface.prototype.interfaceFunc2 = function () { };
}
/** @type {!InterfaceExtendsInterface} */
let interfaceExtendsInterface = { /**
     * @public
     * @return {void}
     */
    interfaceFunc() { }, /**
     * @public
     * @return {void}
     */
    interfaceFunc2() { } };
/**
 * @record
 * tsickle: dropped extends: interface cannot extend/implement class
 */
function InterfaceExtendsClass() { }
/* istanbul ignore if */
if (false) {
    /**
     * @public
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
     * @public
     * @return {void}
     */
    interfaceFunc() { }
}
/**
 * @extends {Class}
 */
class ClassImplementsClass {
    /**
     * @public
     * @return {void}
     */
    classFunc() { }
}
/**
 * @extends {AbstractClass}
 */
class ClassImplementsAbstractClass {
    /**
     * @public
     * @return {void}
     */
    abstractFunc() { }
    // Note: because this class *implements* AbstractClass, it must also implement
    // nonAbstractFunc despite that already having an implementation.
    /**
     * @public
     * @return {void}
     */
    nonAbstractFunc() { }
}
// Permutation 4: class extends.
// Note: cannot "extends" an interface.
// So this is illegal: class ClassExtendsInterface extends Interface {
/**
 * @extends {Class}
 */
class ClassExtendsClass extends Class {
    /**
     * @public
     * @return {void}
     */
    classFunc() { }
}
/**
 * @extends {AbstractClass}
 */
class ClassExtendsAbstractClass extends AbstractClass {
    /**
     * @public
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
     * @public
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
     * @public
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
    // abstractFunc and nonAbstractFunc despite that already having an
    // implementation.
    /**
     * @public
     * @return {void}
     */
    abstractFunc() { }
    /**
     * @public
     * @return {void}
     */
    nonAbstractFunc() { }
}
// Permutation 6: abstract class extends.
// Note: cannot "extends" an interface.
// So this is illegal: class AbstractClassExtendsInterface extends Interface {
/**
 * @abstract
 * @extends {Class}
 */
class AbstractClassExtendsClass extends Class {
    /**
     * @public
     * @return {void}
     */
    classFunc() { }
}
/**
 * @abstract
 * @extends {AbstractClass}
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
     * @public
     * @return {void}
     */
    interfaceFunc() { }
    /**
     * @public
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
 * tsickle: dropped implements: {?} type
 */
class ZoneImplementsInterface {
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    ZoneImplementsInterface.prototype.zone;
}
/** @typedef {?} */
var ZoneAlias;
/**
 * tsickle: dropped implements: {?} type
 */
class ZoneImplementsAlias {
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    ZoneImplementsAlias.prototype.zone;
}
class WithOptionalField {
    constructor() {
        this.optionalField = 'a';
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {(undefined|string)}
     * @public
     */
    WithOptionalField.prototype.optionalField;
}
// TODO: b/280605173 - JS cannot compile the output. Suppressed
// dangerousUnrecognizedTypeError to get this to pass the test.
/**
 * @param {number} base
 * @return {function(new:ScopedClass, number)}
 */
function classMaker(base) {
    return class ScopedClass {
        /**
         * @public
         * @param {number} otherBase
         */
        constructor(otherBase) {
            this.otherBase = otherBase;
        }
        /**
         * @public
         * @param {number} val
         * @return {number}
         */
        normalize(val) {
            return base + this.otherBase + val;
        }
    };
}
