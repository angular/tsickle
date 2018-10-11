// test_files/extend_and_implement/extend_and_implement.ts(15,1): warning TS0: omitting @implements of a class: ClassInImplements
/**
 *
 * @fileoverview Reproduces a problem where tsickle would emit "\\@extends
 * {ClassInImplements}", conflicting the ES6 extends syntax, leading to
 * incorrect optimization results.
 *
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
goog.module('test_files.extend_and_implement.extend_and_implement');
var module = module || { id: 'test_files/extend_and_implement/extend_and_implement.ts' };
module = module;
exports = {};
class ClassInImplements {
}
if (false) {
    /** @type {(undefined|string)} */
    ClassInImplements.prototype.foo;
}
class ClassInExtends {
    /**
     * @return {string}
     */
    bar() {
        return 'a';
    }
}
/**
 * @implements {InexpressibleType}
 */
class ExtendsAndImplementsClass extends ClassInExtends {
}
if (false) {
    /** @type {string} */
    ExtendsAndImplementsClass.prototype.foo;
}
