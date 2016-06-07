goog.module('test_files.functions.functions');var module = module || {id: 'test_files/functions/functions.js'};(function () {
    /**
     * @param {number} a
     * @return {number}
     */
    function FunctionsTest1(a) {
        return a;
    }
    /**
     * @param {number} a
     * @param {number} b
     * @return {void}
     */
    function FunctionsTest2(a, b) { }
    /**
     * @ngInject
     * @param {number} a
     * @param {number} b
     * @return {void}
     */
    function FunctionsTest3(a, b) { }
    /**
     * @param {?} a
     * @return {string}
     */
    function FunctionsTest4(a) {
        return "a";
    }
    /**
     * @param {!{a: number, b: number}} __0
     * @return {void}
     */
    function Destructuring({ a, b }) { }
    /**
     * @param {!Array<number>} __0
     * @param {!Array<!Array<string>>} __1
     * @return {void}
     */
    function Destructuring2([a, b], [[c]]) { }
    /**
     * @param {?} __0
     * @param {?} __1
     * @return {void}
     */
    function Destructuring3([a, b], [[c]]) { }
    Destructuring({ a: 1, b: 2 });
    Destructuring2([1, 2], [['a']]);
    Destructuring3([1, 2], [['a']]);
    /**
     * @param {...number} a
     * @return {void}
     */
    function FunctionsTestsSplat(...a) { }
    /**
     * @param {...number} a
     * @return {void}
     */
    function FunctionsTestsSplat2(...a) { }
    /**
     * @param {...?} a
     * @return {void}
     */
    function FunctionsTestsSplat3(...a) { }
    FunctionsTestsSplat(1, 2);
    FunctionsTestsSplat2(1, 2);
    FunctionsTestsSplat3(1, 2);
})();
