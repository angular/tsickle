// test_files/extend_and_implement/extend_and_implement.ts(16,1): warning TS0: dropped implements: cannot implements a class
/**
 *
 * @fileoverview Reproduces a problem where tsickle would emit "\\@extends
 * {ClassInImplements}", conflicting the ES6 extends syntax, leading to
 * incorrect optimization results.
 * Generated from: test_files/extend_and_implement/extend_and_implement.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.extend_and_implement.extend_and_implement');
var module = module || { id: 'test_files/extend_and_implement/extend_and_implement.ts' };
goog.require('tslib');
class ClassInImplements {
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {(undefined|string)}
     * @public
     */
    ClassInImplements.prototype.foo;
}
class ClassInExtends {
    /**
     * @public
     * @return {string}
     */
    bar() {
        return 'a';
    }
}
/**
 * @extends {ClassInExtends}
 * tsickle: dropped implements: cannot implements a class
 */
class ExtendsAndImplementsClass extends ClassInExtends {
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    ExtendsAndImplementsClass.prototype.foo;
}
