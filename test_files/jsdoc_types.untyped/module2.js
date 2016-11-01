goog.module('test_files.jsdoc_types.untyped.module2');var module = module || {id: 'test_files/jsdoc_types.untyped/module2.js'};
/**
 * @unrestricted
 */
class ClassOne {
}
exports.ClassOne = ClassOne;
/**
 * @unrestricted
 */
class ClassTwo {
}
exports.ClassTwo = ClassTwo;
/**
 * @unrestricted
 */
class ClassWithParams {
}
exports.ClassWithParams = ClassWithParams;
// TODO(evanm):
// export type TypeAlias = number;
// export type TypeAliasWithParam<T> = T[];
exports.value = 3;
