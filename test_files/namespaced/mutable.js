/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.namespaced.mutable');
var module = module || { id: 'test_files/namespaced/mutable.ts' };
module = module;
exports = {};
var mut;
(function (mut) {
    mut.x = 0;
    //export let z = 0, w = 0;
    let y = 0;
    function inc() {
        mut.x++;
        y++;
        //z++;
        //w++;
    }
    mut.inc = inc;
})(mut || (mut = {}));
