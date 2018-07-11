// test_files/class/class.ts(126,42): warning TS0: type/symbol conflict for Zone, using {?} for now
// test_files/class/class.ts(130,38): warning TS0: type/symbol conflict for Zone, using {?} for now
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
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
/** @type {function(): void} */
Interface.prototype.interfaceFunc;
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
/** @type {function(): void} */
InterfaceExtendsInterface.prototype.interfaceFunc2;
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
/** @type {function(): void} */
InterfaceExtendsClass.prototype.interfaceFunc3;
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
    /**
     * @return {void}
     */
    nonAbstractFunc() { }
}
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
    /**
     * @return {void}
     */
    abstractFunc() { }
    /**
     * @return {void}
     */
    nonAbstractFunc() { }
}
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
/** @type {!Interface} */
let interfaceVar;
interfaceVar = interfaceExtendsInterface;
interfaceVar = new ClassImplementsInterface();
interfaceVar = new ImplementsTypeAlias();
/** @type {!Class} */
let classVar;
classVar = new ClassImplementsClass();
classVar = new ClassExtendsClass();
classVar = new ImplementsTypeAlias();
/** @type {!AbstractClass} */
let abstractClassVar;
abstractClassVar = new ClassImplementsAbstractClass();
abstractClassVar = new ClassExtendsAbstractClass();
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
class ZoneImplementsAlias {
}
if (false) {
    /** @type {string} */
    ZoneImplementsAlias.prototype.zone;
}
