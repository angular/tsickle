goog.module('test_files.functions.untyped.functions');var module = module || {id: 'test_files/functions.untyped/functions.js'};(function () {
    /**
     * @param {?} a
     * @return {?}
     */
    function FunctionsTest1(a) {
        return a;
    }
    /**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    function FunctionsTest2(a, b) { }
    /**
     * @ngInject
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    function FunctionsTest3(a, b) { }
    /**
     * @param {?} a
     * @return {?}
     */
    function FunctionsTest4(a) {
        return "a";
    }
    /**
     * @param {?} __0
     * @return {?}
     */
    function Destructuring({ a, b }) { }
    /**
     * @param {?} __0
     * @param {?} __1
     * @return {?}
     */
    function Destructuring2([a, b], [[c]]) { }
    /**
     * @param {?} __0
     * @param {?} __1
     * @return {?}
     */
    function Destructuring3([a, b], [[c]]) { }
    Destructuring({ a: 1, b: 2 });
    Destructuring2([1, 2], [['a']]);
    Destructuring3([1, 2], [['a']]);
    /**
     * @param {...?} a
     * @return {?}
     */
    function FunctionsTestsSplat(...a) { }
    /**
     * @param {...?} a
     * @return {?}
     */
    function FunctionsTestsSplat2(...a) { }
    /**
     * @param {...?} a
     * @return {?}
     */
    function FunctionsTestsSplat3(...a) { }
    FunctionsTestsSplat(1, 2);
    FunctionsTestsSplat2(1, 2);
    FunctionsTestsSplat3(1, 2);
})();
