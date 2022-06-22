// test_files/implements/implements.ts(13,1): warning TS0: dropped implements: dropped implements of a type literal: MyRecord
// test_files/implements/implements.ts(19,1): warning TS0: dropped implements: dropped implements of a type literal: RecordAlias
/**
 *
 * @fileoverview Tests various types of 'implements' clauses, e.g. 'implements'
 * of a generic type alias of an underlying interface.
 * Generated from: test_files/implements/implements.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.implements.implements');
var module = module || { id: 'test_files/implements/implements.ts' };
goog.require('tslib');
/** @typedef {{a: string}} */
var MyRecord;
/**
 * tsickle: dropped implements: dropped implements of a type literal: MyRecord
 */
class RecordImpl {
    constructor() {
        this.a = 'a';
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    RecordImpl.prototype.a;
}
/** @typedef {{a: string}} */
var RecordAlias;
/**
 * tsickle: dropped implements: dropped implements of a type literal: RecordAlias
 */
class RecordAliasImpl {
    constructor() {
        this.a = 'a';
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    RecordAliasImpl.prototype.a;
}
/**
 * @record
 */
function MyInterface() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    MyInterface.prototype.a;
}
/**
 * @implements {MyInterface}
 */
class InterfaceImpl {
    constructor() {
        this.a = 'a';
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    InterfaceImpl.prototype.a;
}
/**
 * @record
 */
function MyOtherInterface() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    MyOtherInterface.prototype.b;
}
/**
 * @implements {MyInterface}
 * @implements {MyOtherInterface}
 */
class InterfaceMultipleImpl {
    constructor() {
        this.a = 'a';
        this.b = 'b';
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    InterfaceMultipleImpl.prototype.a;
    /**
     * @type {string}
     * @public
     */
    InterfaceMultipleImpl.prototype.b;
}
/** @typedef {!MyInterface} */
var Alias;
/**
 * @implements {MyInterface}
 */
class InterfaceAliasImpl {
    constructor() {
        this.a = 'a';
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    InterfaceAliasImpl.prototype.a;
}
/**
 * @record
 * @template A, B
 */
function Generic() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {A}
     * @public
     */
    Generic.prototype.a;
    /**
     * @type {B}
     * @public
     */
    Generic.prototype.b;
}
/**
 * @implements {Generic<string, number>}
 */
class GenericImpl {
    constructor() {
        this.a = 'a';
        this.b = 1;
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    GenericImpl.prototype.a;
    /**
     * @type {number}
     * @public
     */
    GenericImpl.prototype.b;
}
// GenericPartialImpl is a generic implementing a generic.
// The generic args should still make it.
/**
 * @template T
 * @implements {Generic<string, T>}
 */
class GenericPartialImpl {
    constructor() {
        this.a = 'a';
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    GenericPartialImpl.prototype.a;
    /**
     * @type {T}
     * @public
     */
    GenericPartialImpl.prototype.b;
}
/** @typedef {!Generic<string, ?>} */
var AliasGeneric;
/**
 * @implements {Generic<string, number>}
 */
class GenericIndirectImpl {
    constructor() {
        this.a = 'a';
        this.b = 1;
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    GenericIndirectImpl.prototype.a;
    /**
     * @type {number}
     * @public
     */
    GenericIndirectImpl.prototype.b;
}
