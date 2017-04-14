/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */



class SuperTestBaseNoArg {
constructor() {}
}
class SuperTestBaseOneArg {
/**
 * @param {number} x
 */
constructor(public x: number) {}
}

function SuperTestBaseOneArg_tsickle_Closure_declarations() {
/** @type {number} */
SuperTestBaseOneArg.prototype.x;
}

class SuperTestDerivedParamProps extends SuperTestBaseOneArg {
/**
 * @param {string} y
 */
constructor(public y: string) {
    super(3);
  }
}

function SuperTestDerivedParamProps_tsickle_Closure_declarations() {
/** @type {string} */
SuperTestDerivedParamProps.prototype.y;
}

class SuperTestDerivedInitializedProps extends SuperTestBaseOneArg {
  y: string = 'foo';
constructor() {
    super(3);
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
  // NOTE: if this has any properties, we fail to generate it
  // properly because we generate a constructor that doesn't know
  // how to properly call the parent class's super().
}
/**
 * @record
 */
function SuperTestInterface() {}
/** @type {number} */
SuperTestInterface.prototype.foo;


interface SuperTestInterface {
  foo: number;
}
/**
 * @implements {SuperTestInterface}
 */
class SuperTestDerivedInterface implements SuperTestInterface {
  foo: number;
}

function SuperTestDerivedInterface_tsickle_Closure_declarations() {
/** @type {number} */
SuperTestDerivedInterface.prototype.foo;
}

class SuperTestStaticProp extends SuperTestBaseOneArg {
  static foo = 3;
}

function SuperTestStaticProp_tsickle_Closure_declarations() {
/** @type {number} */
SuperTestStaticProp.foo;
}

