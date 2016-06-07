goog.module('test_files.decorator.decorator');var module = module || {id: 'test_files/decorator/decorator.js'};/**
 * @param {Object} a
 * @param {string} b
 * @return {void}
 */
function decorator(a, b) { }
class DecoratorTest {
    static _tsickle_typeAnnotationsHelper() {
        /** @type {number} */
        DecoratorTest.prototype.x;
    }
}
__decorate([
    decorator, 
    __metadata('design:type', Number)
], DecoratorTest.prototype, "x", void 0);
