// test_files/decorator/decorator.ts(19,10): warning TS0: should not emit a 'never' type
goog.module('test_files.decorator.decorator');
var module = module || { id: 'test_files/decorator/decorator.ts' };
const tslib_1 = goog.require('tslib');
const __tsickle_googReflect = goog.require("goog.reflect");
/**
 *
 * @fileoverview OtherClass is reachable via the imports for './external' and
 * './external2'. Test that were using it from the right import, and not just
 * the first that allows access to the value. That is important when imports are
 * elided.
 * Generated from: test_files/decorator/decorator.ts
 * @suppress {uselessCode}
 *
 */
const tsickle_default_export_1 = goog.requireType("test_files.decorator.default_export");
const tsickle_external_2 = goog.requireType("test_files.decorator.external");
const tsickle_external2_3 = goog.requireType("test_files.decorator.external2");
const tsickle_only_types_4 = goog.requireType("test_files.decorator.only_types");
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
function annotationDecorator(a, b) {
    return (/** @type {?} */ (null));
}
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
     * @public
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
         * @public
         * @param {string} x
         * @return {void}
         */
        constructor(x) { } }) { }
    /**
     * @public
     * @return {number}
     */
    get w() {
        return 1;
    }
}
/** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
DecoratorTest.decorators = [
    { type: classAnnotation },
];
/**
 * @type {function(): !Array<(null|{
 *   type: ?,
 *   decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>),
 * })>}
 * @nocollapse
 */
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
/** @type {!Object<string, !Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
DecoratorTest.propDecorators = {
    w: [{ type: annotationDecorator }],
    y: [{ type: annotationDecorator }]
};
tslib_1.__decorate([
    decorator,
    tslib_1.__metadata("design:type", Number)
], DecoratorTest.prototype, __tsickle_googReflect.objectProperty("x", DecoratorTest.prototype), void 0);
tslib_1.__decorate([
    decorator,
    tslib_1.__metadata("design:type", external_1.AClass)
], DecoratorTest.prototype, __tsickle_googReflect.objectProperty("z", DecoratorTest.prototype), void 0);
/* istanbul ignore if */
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
/** @suppress {visibility} */
DecoratedClass = tslib_1.__decorate([
    classDecorator
], DecoratedClass);
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    DecoratedClass.prototype.z;
}
