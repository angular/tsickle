goog.module('closure.y');

const X = goog.require('closure.x');

/** @return {!X.Nested} */
exports.getNested = function() {
  return Math.random() < 0.5 ?
   X.Nested.A : X.Nested.B;
}