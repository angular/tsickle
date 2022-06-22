/**
 *
 * @fileoverview Tests template parameters for generic classes nested inside
 * another generic class.
 *
 * Generated from: test_files/generic_nested_classes/user.ts
 */
goog.module('test_files.generic_nested_classes.user');
var module = module || { id: 'test_files/generic_nested_classes/user.ts' };
goog.require('tslib');
/**
 * @template T
 */
class Outer {
    /**
     * @public
     * @return {void}
     */
    outer() {
        /**
         * @template P
         */
        class Inner {
            /**
             * @public
             * @return {void}
             */
            inner() {
                /**
                 * @template O
                 */
                class VeryDeep {
                }
                /** @type {!VeryDeep<boolean>} */
                const deep = new VeryDeep();
            }
        }
        /** @type {!Inner<number>} */
        const inner = new Inner();
    }
}
