// test_files/conditional_rest_tuple_type/conditional_rest_tuple_type.ts(6,38): warning TS0: failed to resolve rest parameter type, emitting ?
// test_files/conditional_rest_tuple_type/conditional_rest_tuple_type.ts(8,14): warning TS0: unable to translate rest args type
// test_files/conditional_rest_tuple_type/conditional_rest_tuple_type.ts(9,31): warning TS0: failed to resolve rest parameter type, emitting ?
/**
 *
 * @fileoverview Tests an interaction between conditional types and rest (...)
 * types.
 *
 * Generated from: test_files/conditional_rest_tuple_type/conditional_rest_tuple_type.ts
 */
goog.module('test_files.conditional_rest_tuple_type.conditional_rest_tuple_type');
var module = module || { id: 'test_files/conditional_rest_tuple_type/conditional_rest_tuple_type.ts' };
goog.require('tslib');
/**
 * @template T
 * @param {...?} args
 * @return {void}
 */
function conditionalRestTupleType(...args) { }
/** @type {{conditionalRestTupleType: function(...?): void}} */
exports.x = {
    /**
     * @public
     * @template T
     * @param {...?} args
     * @return {void}
     */
    conditionalRestTupleType(...args) {
        conditionalRestTupleType(...args);
    }
};
