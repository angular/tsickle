goog.module('test_files.decorator.issue_547');var module = module || {id: 'test_files/decorator/issue_547.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var /** @type {!Function} */ describe;
var /** @type {!Function} */ it;
/**
 * \@Annotation
 */
var /** @type {!Function} */ Component;
/**
 * @return {void}
 */
function main() {
    describe(() => {
        class SomeService {
        }
        it(() => {
            class TestComp3 {
                /**
                 * @param {!SomeService} service
                 */
                constructor(service) { }
            }
            TestComp3.decorators = [
                { type: Component, args: [{ template: '<div someDir>{{1 | somePipe}}</div>' },] },
            ];
            /** @nocollapse */
            TestComp3.ctorParameters = () => [
                { type: , },
            ];
        });
    });
}
exports.main = main;
