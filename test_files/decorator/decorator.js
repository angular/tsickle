// test_files/decorator/decorator.ts(13,66): warning TS0: should not emit a 'never' type
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.decorator.decorator');
var module = module || { id: 'test_files/decorator/decorator.ts' };
module = module;
exports = {};
const tslib_1 = goog.require('tslib');
const tsickle_default_export_1 = goog.requireType("test_files.decorator.default_export");
const tsickle_external_2 = goog.requireType("test_files.decorator.external");
const tsickle_external2_3 = goog.requireType("test_files.decorator.external2");
const tsickle_only_types_4 = goog.requireType("test_files.decorator.only_types");
// OtherClass is reachable via the imports for './external' and './external2'.
// Test that were using it from the right import, and not just the first
// that allows access to the value. That is important when imports are elided.
const default_export_1 = goog.require('test_files.decorator.default_export');
const external_1 = goog.require('test_files.decorator.external');
const external2_1 = goog.require('test_files.decorator.external2');
const api = goog.require('test_files.decorator.only_types');
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
function annotationDecorator(a, b) { return (/** @type {?} */ (null)); }
/**
 * @param {?} t
 * @return {?}
 */
function classDecorator(t) {
    return t;
}
// should not matter, but getDeclarations() returns this node too.
// Comment comes after statement so that type alias does not have
// a comment on its own.
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
     * @param {!tsickle_external_2.AClass} aClass
     * @param {!tsickle_external_2.AClass} AClass
     * @param {!tsickle_external_2.AClass} aRenamedClass
     * @param {!tsickle_external_2.AClassWithGenerics<string>} aClassWithGenerics
     * @param {!tsickle_external_2.AType} aType
     * @param {!tsickle_default_export_1.default} defaultImport
     * @param {!Map<string, number>} localTypeAlias
     * @param {!tsickle_external2_3.OtherClass} otherClass
     * @param {!tsickle_external2_3.OtherClass} anotherClass
     * @param {!Array<!tsickle_only_types_4.AnotherType>} anotherType
     * @param {!tsickle_only_types_4.AnotherType} anotherPrefixed
     * @param {function(!tsickle_external_2.AType): string} fnUsingAType
     * @param {{constructor: function(string): void}=} valueWithCtorSignature
     */
    constructor(a, anyDecorated, n, b, promise, arr, aClass, AClass, aRenamedClass, aClassWithGenerics, aType, defaultImport, localTypeAlias, otherClass, anotherClass, anotherType, anotherPrefixed, fnUsingAType, valueWithCtorSignature = { /**
         * @param {string} x
         * @return {void}
         */
        constructor(x) { } }) { }
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
if (false) {
    /**
     * Some comment
     * @type {number}
     * @private
     */
    DecoratorTest.prototype.x;
    /**
     * @type {number}
     * @private
     */
    DecoratorTest.prototype.y;
    /**
     * @type {!tsickle_external_2.AClass}
     * @private
     */
    DecoratorTest.prototype.z;
}
let DecoratedClass = class DecoratedClass {
};
DecoratedClass = tslib_1.__decorate([
    classDecorator
], DecoratedClass);
if (false) {
    /** @type {string} */
    DecoratedClass.prototype.z;
}
