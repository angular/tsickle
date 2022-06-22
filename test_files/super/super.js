/**
 *
 * @fileoverview
 * Generated from: test_files/super/super.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.super.super');
var module = module || { id: 'test_files/super/super.ts' };
goog.require('tslib');
class SuperTestBaseNoArg {
    /**
     * @public
     */
    constructor() { }
}
class SuperTestBaseOneArg {
    /**
     * @public
     * @param {number} x
     */
    constructor(x) {
        this.x = x;
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
    SuperTestBaseOneArg.prototype.x;
}
// A ctor with a parameter property.
/**
 * @extends {SuperTestBaseOneArg}
 */
class SuperTestDerivedParamProps extends SuperTestBaseOneArg {
    /**
     * @public
     * @param {string} y
     */
    constructor(y) {
        super(3);
        this.y = y;
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    SuperTestDerivedParamProps.prototype.y;
}
// A ctor with an initialized property.
/**
 * @extends {SuperTestBaseOneArg}
 */
class SuperTestDerivedInitializedProps extends SuperTestBaseOneArg {
    /**
     * @public
     */
    constructor() {
        super(3);
        this.y = 'foo';
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    SuperTestDerivedInitializedProps.prototype.y;
}
// A ctor with a super() but none of the above two details.
/**
 * @extends {SuperTestBaseOneArg}
 */
class SuperTestDerivedOrdinary extends SuperTestBaseOneArg {
    /**
     * @public
     */
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
    /**
     * @type {number}
     * @public
     */
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
    /**
     * @type {number}
     * @public
     */
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
    /**
     * @type {number}
     * @public
     */
    SuperTestStaticProp.foo;
}
