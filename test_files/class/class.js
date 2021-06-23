// test_files/class/class.ts(44,1): warning TS0: dropped extends: interface cannot extend/implement class
// test_files/class/class.ts(124,1): warning TS0: type/symbol conflict for Zone, using {?} for now
// test_files/class/class.ts(128,42): warning TS0: type/symbol conflict for Zone, using {?} for now
// test_files/class/class.ts(128,1): warning TS0: dropped implements: {?} type
// test_files/class/class.ts(131,1): warning TS0: type/symbol conflict for Zone, using {?} for now
// test_files/class/class.ts(132,38): warning TS0: type/symbol conflict for Zone, using {?} for now
// test_files/class/class.ts(132,1): warning TS0: dropped implements: {?} type
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/class/class.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
goog.require('tslib');
/**
 * @record
 */
function Interface() { }
/* istanbul ignore if */
if (COMPILED) {
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
/* istanbul ignore if */
if (COMPILED) {
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
/* istanbul ignore if */
if (COMPILED) {
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
 * tsickle: dropped extends: interface cannot extend/implement class
 */
function InterfaceExtendsClass() { }
/* istanbul ignore if */
if (COMPILED) {
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
/**
 * @extends {Class}
 */
class ClassExtendsClass extends Class {
    /**
     * @return {void}
     */
    classFunc() { }
}
/**
 * @extends {AbstractClass}
 */
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
 * @extends {Class}
 */
class AbstractClassExtendsClass extends Class {
    /**
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
 * tsickle: dropped implements: {?} type
 */
class ZoneImplementsInterface {
}
/* istanbul ignore if */
if (COMPILED) {
    /** @type {string} */
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
if (COMPILED) {
    /** @type {string} */
    ZoneImplementsAlias.prototype.zone;
}
class WithOptionalField {
    constructor() {
        this.optionalField = 'a';
    }
}
/* istanbul ignore if */
if (COMPILED) {
    /** @type {(undefined|string)} */
    WithOptionalField.prototype.optionalField;
}
