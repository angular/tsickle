/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */



/**
 * @record
 */
function UpperBound() {}
/** @type {number} */
UpperBound.prototype.x;
interface UpperBound {
  x: number;
}
// unsupported: template constraints.
/**
 * @record
 * @template T, U
 */
function WithTypeParam() {}
/** @type {T} */
WithTypeParam.prototype.tea;
/** @type {U} */
WithTypeParam.prototype.you;


interface WithTypeParam<T extends UpperBound, U> {
  tea: T;
  you: U;
}
