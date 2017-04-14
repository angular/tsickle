goog.module('test_files.super.super');var module = module || {id: 'test_files/super/super.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */
class SuperTestBaseNoArg {
    constructor() { }
}
class SuperTestBaseOneArg {
    /**
     * @param {number} x
     */
    constructor(x) {
        this.x = x;
    }
}
function SuperTestBaseOneArg_tsickle_Closure_declarations() {
    /** @type {number} */
    SuperTestBaseOneArg.prototype.x;
}
class SuperTestDerivedParamProps extends SuperTestBaseOneArg {
    /**
     * @param {string} y
     */
    constructor(y) {
        super(3);
        this.y = y;
    }
}
function SuperTestDerivedParamProps_tsickle_Closure_declarations() {
    /** @type {string} */
    SuperTestDerivedParamProps.prototype.y;
}
class SuperTestDerivedInitializedProps extends SuperTestBaseOneArg {
    constructor() {
        super(3);
        this.y = 'foo';
    }
}
function SuperTestDerivedInitializedProps_tsickle_Closure_declarations() {
    /** @type {string} */
    SuperTestDerivedInitializedProps.prototype.y;
}
class SuperTestDerivedOrdinary extends SuperTestBaseOneArg {
    constructor() {
        super(3);
    }
}
class SuperTestDerivedNoCTorNoArg extends SuperTestBaseNoArg {
}
class SuperTestDerivedNoCTorOneArg extends SuperTestBaseOneArg {
}
/**
 * @record
 */
function SuperTestInterface() { }
/** @type {number} */
SuperTestInterface.prototype.foo;
/**
 * @implements {SuperTestInterface}
 */
class SuperTestDerivedInterface {
}
function SuperTestDerivedInterface_tsickle_Closure_declarations() {
    /** @type {number} */
    SuperTestDerivedInterface.prototype.foo;
}
class SuperTestStaticProp extends SuperTestBaseOneArg {
}
SuperTestStaticProp.foo = 3;
function SuperTestStaticProp_tsickle_Closure_declarations() {
    /** @type {number} */
    SuperTestStaticProp.foo;
}
