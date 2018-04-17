// Warning at test_files/class/class.ts:129:1: type/symbol conflict for Zone, using {?} for now
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.class.class');
var module = module || { id: 'test_files/class/class.ts' };
// This test exercises the various ways classes and interfaces can interact.
// There are three types of classy things:
//   interface, class, abstract class
// And there are two keywords for relating them:
//   extends, implements
// You can legally use them in almost any configuration the cross product implies;
// for example, you can "implements" a class though it's more rare than the
// other options.
/**
 * @record
 */
function Interface() { }
function Interface_tsickle_Closure_declarations() {
    /** @type {function(): void} */
    Interface.prototype.interfaceFunc;
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
function AbstractClass_tsickle_Closure_declarations() {
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
function InterfaceExtendsInterface_tsickle_Closure_declarations() {
    /** @type {function(): void} */
    InterfaceExtendsInterface.prototype.interfaceFunc2;
}
let /** @type {!InterfaceExtendsInterface} */ interfaceExtendsInterface = {
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
function InterfaceExtendsClass_tsickle_Closure_declarations() {
    /** @type {function(): void} */
    InterfaceExtendsClass.prototype.interfaceFunc3;
}
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
/** @typedef {!Interface} */
var TypeAlias;
/**
 * @implements {TypeAlias}
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
let /** @type {!Interface} */ interfaceVar;
interfaceVar = interfaceExtendsInterface;
interfaceVar = new ClassImplementsInterface();
interfaceVar = new ImplementsTypeAlias();
// Verify Closure accepts the various subtypes of Class.
let /** @type {!Class} */ classVar;
classVar = new ClassImplementsClass();
classVar = new ClassExtendsClass();
classVar = new ImplementsTypeAlias();
// Verify Closure accepts the various subtypes of AbstractClass.
let /** @type {!AbstractClass} */ abstractClassVar;
abstractClassVar = new ClassImplementsAbstractClass();
abstractClassVar = new ClassExtendsAbstractClass();
/**
 * @return {void}
 */
function Zone() { }
class ZoneImplementsInterface {
}
function ZoneImplementsInterface_tsickle_Closure_declarations() {
    /** @type {string} */
    ZoneImplementsInterface.prototype.zone;
}
/** @typedef {?} */
var ZoneAlias;
class ZoneImplementsAlias {
}
function ZoneImplementsAlias_tsickle_Closure_declarations() {
    /** @type {string} */
    ZoneImplementsAlias.prototype.zone;
}
