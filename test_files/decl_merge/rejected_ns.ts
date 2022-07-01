/**
 * @fileoverview Test namespace transformations that are not supported
 *   and result in compiler errors.
 *
 * @suppress {uselessCode}
 */

// Namespace that is not merging with a class is not supported.
namespace notMerging {}

// Declaration merging with function is not supported.
function funcToBeMerged() {}
namespace funcToBeMerged {}

// Declaration merging with enums is not supported.
enum Colors {
  red,
  green,
  blue
}
namespace Colors {}
