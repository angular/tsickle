/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire} checked by tsc
 */
goog.module('test_files.decorator.decorator');
var module = module || { id: 'test_files/decorator/decorator.ts' };
var tslib_1 = goog.require('tslib');
var default_export_1 = goog.require('test_files.decorator.default_export');
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.decorator.default_export");
var external_1 = goog.require('test_files.decorator.external');
const tsickle_forward_declare_2 = goog.forwardDeclare("test_files.decorator.external");
var external2_1 = goog.require('test_files.decorator.external2');
const tsickle_forward_declare_3 = goog.forwardDeclare("test_files.decorator.external2");
const tsickle_forward_declare_4 = goog.forwardDeclare("test_files.decorator.only_types");
goog.require("test_files.decorator.only_types"); // force type-only module to be loaded
var api = goog.require('test_files.decorator.only_types');
const tsickle_forward_declare_5 = goog.forwardDeclare("test_files.decorator.only_types");
goog.require("test_files.decorator.only_types"); // force type-only module to be loaded
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
 * @return {?}
 */
function annotationDecorator(a, b) { return /** @type {null} */ ((null)); }
/**
 * @param {?} t
 * @return {?}
 */
function classDecorator(t) {
    return t;
}
/**
 * \@Annotation
 * @param {?} t
 * @return {?}
 */
function classAnnotation(t) {
    return t;
}
/** @typedef {!Map<string, number>} */
var LocalTypeAlias;
class DecoratorTest {
    /**
     * @param {!Array<?>} a
     * @param {?} anyDecorated
     * @param {number} n
     * @param {boolean} b
     * @param {!Promise<string>} promise
     * @param {!Array<string>} arr
     * @param {!tsickle_forward_declare_2.AClass} aClass
     * @param {!tsickle_forward_declare_2.AClass} AClass
     * @param {!tsickle_forward_declare_2.AClass} aRenamedClass
     * @param {!tsickle_forward_declare_2.AClassWithGenerics<string>} aClassWithGenerics
     * @param {!tsickle_forward_declare_2.AType} aType
     * @param {!tsickle_forward_declare_1.default} defaultImport
     * @param {!Map<string, number>} localTypeAlias
     * @param {!tsickle_forward_declare_3.OtherClass} otherClass
     * @param {!tsickle_forward_declare_3.OtherClass} anotherClass
     * @param {!Array<!tsickle_forward_declare_5.AnotherType>} anotherType
     * @param {!tsickle_forward_declare_5.AnotherType} anotherPrefixed
     * @param {function(!tsickle_forward_declare_2.AType): string} fnUsingAType
     * @param {{constructor: function(string): void}=} valueWithCtorSignature
     */
    constructor(a, anyDecorated, n, b, promise, arr, aClass, AClass, aRenamedClass, aClassWithGenerics, aType, defaultImport, localTypeAlias, otherClass, anotherClass, anotherType, anotherPrefixed, fnUsingAType, valueWithCtorSignature = {
        /**
         * @param {string} x
         * @return {void}
         */
        constructor(x) { }
    }) { }
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
    { type: Array },
    { type: undefined, decorators: [{ type: annotationDecorator, args: [1, 'args',] }] },
    { type: Number },
    { type: Boolean },
    { type: Promise },
    { type: Array },
    { type: external_1.AClass },
    { type: external_1.AClass },
    { type: external_1.AClass },
    { type: external_1.AClassWithGenerics },
    { type: undefined },
    { type: default_export_1.default },
    { type: undefined },
    { type: external2_1.OtherClass },
    { type: external_1.ReexportedOtherClass },
    { type: Array },
    { type: undefined },
    { type: Function },
    null
];
DecoratorTest.propDecorators = {
    w: [{ type: annotationDecorator }],
    y: [{ type: annotationDecorator }]
};
tslib_1.__decorate([
    decorator,
    tslib_1.__metadata("design:type", Number)
], DecoratorTest.prototype, "x", void 0);
tslib_1.__decorate([
    decorator,
    tslib_1.__metadata("design:type", external_1.AClass)
], DecoratorTest.prototype, "z", void 0);
function DecoratorTest_tsickle_Closure_declarations() {
    /**
     * Some comment
     * @type {number}
     */
    DecoratorTest.prototype.x;
    /** @type {number} */
    DecoratorTest.prototype.y;
    /** @type {!tsickle_forward_declare_2.AClass} */
    DecoratorTest.prototype.z;
}
let DecoratedClass = class DecoratedClass {
};
DecoratedClass = tslib_1.__decorate([
    classDecorator
], DecoratedClass);
function DecoratedClass_tsickle_Closure_declarations() {
    /** @type {string} */
    DecoratedClass.prototype.z;
}
