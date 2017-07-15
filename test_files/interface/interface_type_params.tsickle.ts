/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */


/**
 * @record
 */
function UpperBound() {}


function UpperBound_tsickle_Closure_declarations() {
/** @type {number} */
UpperBound.prototype.x;
}
interface UpperBound {
  x: number;
}
// unsupported: template constraints.
/**
 * @record
 * @template T, U
 */
function WithTypeParam() {}


function WithTypeParam_tsickle_Closure_declarations() {
/** @type {T} */
WithTypeParam.prototype.tea;
/** @type {U} */
WithTypeParam.prototype.you;
}


interface WithTypeParam<T extends UpperBound, U> {
  tea: T;
  you: U;
}
