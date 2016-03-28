(function () {
    /**
     * @param {?} a
     * @return {?}
     */
    function FunctionsTest1(a) {
        return "a";
    }
    /**
     * @param {?} a
     * @param {?} b
     */
    function FunctionsTest2(a, b) { }
    /**
     * @ngInject
     * @param {?} a
     * @param {?} b
     */
    function FunctionsTest3(a, b) { }
    /**
     * @param {?} param0
     */
    function Destructuring({ a, b }) { }
    /**
     * @param {?} param0
     * @param {?} param1
     */
    function Destructuring2([a, b], [[c]]) { }
    Destructuring({ a: 1, b: 2 });
    Destructuring2([1, 2], [['a']]);
    /**
     * @param {...?} a
     */
    function FunctionsTestsSplat(...a) { }
    /**
     * @param {...?} a
     */
    function FunctionsTestsSplat2(...a) { }
    /**
     * @param a
     */
    function FunctionsTestsSplat3(...a) { }
    FunctionsTestsSplat(1, 2);
    FunctionsTestsSplat2(1, 2);
    FunctionsTestsSplat3(1, 2);
})();
