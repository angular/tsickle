goog.module('test_files.abstract.abstract');var module = module || {id: 'test_files/abstract/abstract.js'};class Base {
    /**
     * @abstract
     * @return {void}
     */
    foo() { }
    /**
     * @return {void}
     */
    bar() { this.foo(); }
}
class Derived extends Base {
    /**
     */
    constructor() {
        super();
    }
    /**
     * @return {void}
     */
    foo() { }
}
let /** @type {Base} */ x = new Derived();
