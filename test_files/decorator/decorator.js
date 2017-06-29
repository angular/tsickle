goog.module('test_files.decorator.decorator');var module = module || {id: 'test_files/decorator/decorator.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

var external_1 = goog.require('test_files.decorator.external');
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.decorator.external");
/**
 * @param {!Object} a
 * @param {string} b
 * @return {void}
 */
function decorator(a, b) { }
/**
 * \@Annotation
 * @param {!Object} a
 * @param {string} b
 * @return {void}
 */
function annotationDecorator(a, b) { }
/**
 * @param {?} t
 * @return {?}
 */
function classDecorator(t) { return t; }
/**
 * \@Annotation
 * @param {?} t
 * @return {?}
 */
function classAnnotation(t) { return t; }
class DecoratorTest {
    /**
     * @param {!Array<?>} a
     * @param {number} n
     * @param {boolean} b
     * @param {!Promise<string>} promise
     * @param {!Array<string>} arr
     * @param {!tsickle_forward_declare_1.AClass} aClass
     * @param {!tsickle_forward_declare_1.AClassWithGenerics<string>} aClassWithGenerics
     * @param {!tsickle_forward_declare_1.AType} aType
     */
    constructor(a, n, b, promise, arr, aClass, aClassWithGenerics, aType) { }
    /**
     * @return {number}
     */
    get w() {
        return 1;
    }
}
DecoratorTest.decorators = [
    { type: classAnnotation },
];
/** @nocollapse */
DecoratorTest.ctorParameters = () => [
    { type: Array, },
    null,
    null,
    { type: Promise, },
    { type: Array, },
    { type: external_1.AClass, },
    { type: external_1.AClassWithGenerics, },
    null,
];
DecoratorTest.propDecorators = {
    "w": [{ type: annotationDecorator },],
    "y": [{ type: annotationDecorator },],
};
__decorate([
    decorator,
    __metadata("design:type", Number)
], DecoratorTest.prototype, "x", void 0);
__decorate([
    decorator,
    __metadata("design:type", external_1.AClass)
], DecoratorTest.prototype, "z", void 0);
function DecoratorTest_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    DecoratorTest.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    DecoratorTest.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    DecoratorTest.propDecorators;
    /**
     * Some comment
     * @type {number}
     */
    DecoratorTest.prototype.x;
    /** @type {number} */
    DecoratorTest.prototype.y;
    /** @type {!tsickle_forward_declare_1.AClass} */
    DecoratorTest.prototype.z;
}
let DecoratedClass = class DecoratedClass {
};
DecoratedClass = __decorate([
    classDecorator
], DecoratedClass);
function DecoratedClass_tsickle_Closure_declarations() {
    /** @type {string} */
    DecoratedClass.prototype.z;
}
