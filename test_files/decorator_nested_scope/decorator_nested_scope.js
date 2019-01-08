/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.decorator_nested_scope.decorator_nested_scope');
var module = module || { id: 'test_files/decorator_nested_scope/decorator_nested_scope.ts' };
module = module;
exports = {};
class SomeService {
}
/**
 * @return {void}
 */
function main() {
    class TestComp3 {
        /**
         * @param {!SomeService} service
         */
        constructor(service) { }
    }
    TestComp3.decorators = [
        { type: Component },
    ];
    /** @nocollapse */
    TestComp3.ctorParameters = () => [
        { type: SomeService }
    ];
}
exports.main = main;
