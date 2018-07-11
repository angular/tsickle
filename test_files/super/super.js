/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.super.super');
var module = module || { id: 'test_files/super/super.ts' };
module = module;
exports = {};
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
if (false) {
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
if (false) {
    /** @type {string} */
    SuperTestDerivedParamProps.prototype.y;
}
class SuperTestDerivedInitializedProps extends SuperTestBaseOneArg {
    constructor() {
        super(3);
        this.y = 'foo';
    }
}
if (false) {
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
if (false) {
    /** @type {number} */
    SuperTestDerivedInterface.prototype.foo;
}
class SuperTestStaticProp extends SuperTestBaseOneArg {
}
SuperTestStaticProp.foo = 3;
if (false) {
    /** @type {number} */
    SuperTestStaticProp.foo;
}
