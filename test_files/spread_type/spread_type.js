/**
 * @fileoverview Checks that spread operator in type literals is
 *   handled correctly.
 *   Test cases adapted from b/333548529.
 *
 * Generated from: test_files/spread_type/spread_type.ts
 * @suppress {checkTypes}
 */
goog.module('test_files.spread_type.spread_type');
var module = module || { id: 'test_files/spread_type/spread_type.ts' };
goog.require('tslib');
/**
 * @return {boolean}
 */
function randBool() {
    return Math.random() < 0.5;
}
/**
 * @return {{bar: (undefined|string)}}
 */
function spread1() {
    return Object.assign({}, (randBool() && { bar: 'baz' }));
}
/** @type {{bar: (undefined|string)}} */
const result1 = spread1();
/**
 * @return {{bar: (undefined|string), foo: number}}
 */
function spread2() {
    return Object.assign({ foo: 1 }, (randBool() && { bar: 'baz' }));
}
/** @type {{bar: (undefined|string), foo: number}} */
const result2 = spread2();
/**
 * @return {{bar: (undefined|string)}}
 */
function optional1() {
    return { bar: randBool() ? 'baz' : undefined };
}
/**
 * @return {{bar: (undefined|string)}}
 */
function optional2() {
    /** @type {{bar: (undefined|string)}} */
    const ret = {};
    if (randBool())
        ret.bar = 'baz';
    return ret;
}
