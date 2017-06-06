/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */


/**
 * @abstract
 */
abstract class Base {
  abstract simple(): void;
public abstract publicAbstract(): void;
public abstract params(x: number[]): void;

  // Verify we properly handle functions without a declared return type.
  abstract noReturnType();

  // Verify we properly handle functions that expect a return value.
  abstract hasReturnType(): number;
/**
 * @return {void}
 */
bar() {
    this.simple();
    this.publicAbstract();
    this.params([]);
    this.noReturnType();
    this.hasReturnType();
  }
}

function Base_tsickle_Closure_declarations() {

/**
 * @abstract
 * @return {void}
 */
Base.prototype.simple = function() {};

/**
 * @abstract
 * @return {void}
 */
Base.prototype.publicAbstract = function() {};

/**
 * @abstract
 * @param {!Array<number>} x
 * @return {void}
 */
Base.prototype.params = function(x) {};

/**
 * @abstract
 * @return {?}
 */
Base.prototype.noReturnType = function() {};

/**
 * @abstract
 * @return {number}
 */
Base.prototype.hasReturnType = function() {};
}

class Derived extends Base {
constructor() {
    super();
  }
/**
 * @return {void}
 */
simple() {}
/**
 * @return {void}
 */
publicAbstract() {}
/**
 * @param {!Array<number>} x
 * @return {void}
 */
params(x: number[]): void { }
/**
 * @return {void}
 */
noReturnType() {}
/**
 * @return {number}
 */
hasReturnType(): number { return 3; }
}

let /** @type {!Base} */ x: Base = new Derived();
