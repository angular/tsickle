/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.super.super');var module = module || {id: 'test_files/super/super.js'};class SuperTestBaseNoArg {
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
/** @type {number} */
SuperTestBaseOneArg.prototype.x;
class SuperTestDerivedParamProps extends SuperTestBaseOneArg {
    /**
     * @param {string} y
     */
    constructor(y) {
        super(3);
        this.y = y;
    }
}
/** @type {string} */
SuperTestDerivedParamProps.prototype.y;
class SuperTestDerivedInitializedProps extends SuperTestBaseOneArg {
    constructor() {
        super(3);
        this.y = 'foo';
    }
}
/** @type {string} */
SuperTestDerivedInitializedProps.prototype.y;
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
function SuperTestInterface_tsickle_Closure_declarations() {
    /** @type {number} */
    SuperTestInterface.prototype.foo;
}
/**
 * @implements {SuperTestInterface}
 */
class SuperTestDerivedInterface {
}
/** @type {number} */
SuperTestDerivedInterface.prototype.foo;
class SuperTestStaticProp extends SuperTestBaseOneArg {
}
SuperTestStaticProp.foo = 3;
/** @type {number} */
SuperTestStaticProp.foo;
