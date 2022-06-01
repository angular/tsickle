/**
 * @fileoverview added by tsickle
 * Generated from: test_files/decorator_nested_scope/decorator_nested_scope.ts
 */
goog.module('test_files.decorator_nested_scope.decorator_nested_scope');
var module = module || { id: 'test_files/decorator_nested_scope/decorator_nested_scope.ts' };
goog.require('tslib');
class SomeService {
}
/**
 * @return {void}
 */
function main() {
    class TestComp3 {
        /**
         * @public
         * @param {!SomeService} service
         */
        constructor(service) { }
    }
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    TestComp3.decorators = [
        { type: Component },
    ];
    /**
     * @type {function(): !Array<(null|{
     *   type: ?,
     *   decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>),
     * })>}
     * @nocollapse
     */
    TestComp3.ctorParameters = () => [
        { type: SomeService }
    ];
}
exports.main = main;
