/**
 * @fileoverview added by tsickle
 * Generated from: test_files/super/super.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.super.super');
var module = module || { id: 'test_files/super/super.ts' };
goog.require('tslib');
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
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    SuperTestBaseOneArg.prototype.x;
}
// A ctor with a parameter property.
/**
 * @extends {SuperTestBaseOneArg}
 */
class SuperTestDerivedParamProps extends SuperTestBaseOneArg {
    /**
     * @param {string} y
     */
    constructor(y) {
        super(3);
        this.y = y;
    }
}
/* istanbul ignore if */
if (false) {
    /** @type {string} */
    SuperTestDerivedParamProps.prototype.y;
}
// A ctor with an initialized property.
/**
 * @extends {SuperTestBaseOneArg}
 */
class SuperTestDerivedInitializedProps extends SuperTestBaseOneArg {
    constructor() {
        super(3);
        this.y = 'foo';
    }
}
/* istanbul ignore if */
if (false) {
    /** @type {string} */
    SuperTestDerivedInitializedProps.prototype.y;
}
// A ctor with a super() but none of the above two details.
/**
 * @extends {SuperTestBaseOneArg}
 */
class SuperTestDerivedOrdinary extends SuperTestBaseOneArg {
    constructor() {
        super(3);
    }
}
// A class without a ctor, extending a one-arg ctor parent.
/**
 * @extends {SuperTestBaseNoArg}
 */
class SuperTestDerivedNoCTorNoArg extends SuperTestBaseNoArg {
}
// A class without a ctor, extending a no-arg ctor parent.
/**
 * @extends {SuperTestBaseOneArg}
 */
class SuperTestDerivedNoCTorOneArg extends SuperTestBaseOneArg {
}
/**
 * @record
 */
function SuperTestInterface() { }
/* istanbul ignore if */
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
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    SuperTestDerivedInterface.prototype.foo;
}
/**
 * @extends {SuperTestBaseOneArg}
 */
class SuperTestStaticProp extends SuperTestBaseOneArg {
}
SuperTestStaticProp.foo = 3;
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    SuperTestStaticProp.foo;
}
