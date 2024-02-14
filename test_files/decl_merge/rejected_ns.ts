/**
 * @fileoverview Test namespace transformations that are not supported
 *   and result in compiler errors.
 *
 * @suppress {uselessCode,checkTypes}
 */

// Namespace that is not merging with a class is not supported.
namespace notMerging {}

// Declaration merging with function is not supported.
function funcToBeMerged() {}
namespace funcToBeMerged {}


// Adding const values is only allowed on interfaces.
class Cabbage {}
namespace Cabbage {
  export const C = 0;
}

// Adding functions is only allowed on enums.
namespace Cabbage {
  export function foo() {};
}

const o = {
  a: 0,
  b: ''
};

interface Inbetween {}
namespace Inbetween {
  export enum WHAT_FISH {RED_FISH, BLUE_FISH}
  // Merged values must be const.
  export var v = 0;
  // Merged const values must be exported.
  const K = 0;
  // Destructuring declarations are not allowed.
  export const {a, b} = o;
}

namespace Inbetween {
  export function foo() {}
}
// Nested namespaces are not supported.
class A {}
namespace A.B {}
