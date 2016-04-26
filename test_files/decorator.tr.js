goog.module('sickle_test.decorator');/**
 * @param {Object} a
 * @param {string} b
 * @return {void}
 */
function decorator(a, b) { }
class DecoratorTest {
    static _sickle_typeAnnotationsHelper() {
        /** @type {number} */
        DecoratorTest.prototype.x;
    }
}
__decorate([
    decorator, 
    __metadata('design:type', Number)
], DecoratorTest.prototype, "x", void 0);
