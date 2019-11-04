/**
 * @fileoverview added by tsickle
 * Generated from: test_files/super/super.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.super.super');
var module = module || { id: 'test_files/super/super.ts' };
module = module;
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
// A ctor with a parameter property.
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
// A ctor with an initialized property.
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
// A ctor with a super() but none of the above two details.
class SuperTestDerivedOrdinary extends SuperTestBaseOneArg {
    constructor() {
        super(3);
    }
}
// A class without a ctor, extending a one-arg ctor parent.
class SuperTestDerivedNoCTorNoArg extends SuperTestBaseNoArg {
}
// A class without a ctor, extending a no-arg ctor parent.
class SuperTestDerivedNoCTorOneArg extends SuperTestBaseOneArg {
}
/**
 * @record
 */
function SuperTestInterface() { }
if (false) {
    /** @type {number} */
    SuperTestInterface.prototype.foo;
}
// A class implementing an interface.
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
