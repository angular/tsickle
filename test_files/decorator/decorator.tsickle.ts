/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

// OtherClass is reachable via the imports for './external' and './external2'.
// Test that were using it from the right import, and not just the first
// that allows access to the value. That is important when imports are elided.
import {AClass, AClass as ARenamedClass, AType, AClassWithGenerics, ReexportedOtherClass} from './external';
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.decorator.external");
import {OtherClass} from './external2';
const tsickle_forward_declare_2 = goog.forwardDeclare("test_files.decorator.external2");
/**
 * @param {!Object} a
 * @param {string} b
 * @return {void}
 */
function decorator(a: Object, b: string) {}
/**
 * \@Annotation
 * @param {!Object} a
 * @param {string} b
 * @return {void}
 */
function annotationDecorator(a: Object, b: string) {}
/**
 * @param {?} t
 * @return {?}
 */
function classDecorator(t: any) { return t; }

type classAnnotation = {};
/**
 * \@Annotation
 * @param {?} t
 * @return {?}
 */
function classAnnotation(t: any) { return t; }
class DecoratorTest {
/**
 * @param {!Array<?>} a
 * @param {number} n
 * @param {boolean} b
 * @param {!Promise<string>} promise
 * @param {!Array<string>} arr
 * @param {!tsickle_forward_declare_1.AClass} aClass
 * @param {!tsickle_forward_declare_1.AClass} AClass
 * @param {!tsickle_forward_declare_1.AClass} aRenamedClass
 * @param {!tsickle_forward_declare_1.AClassWithGenerics<string>} aClassWithGenerics
 * @param {!tsickle_forward_declare_1.AType} aType
 * @param {!tsickle_forward_declare_2.OtherClass} otherClass
 * @param {!tsickle_forward_declare_2.OtherClass} anotherClass
 */
constructor(a: any[], n: number, b: boolean, promise: Promise<string>, arr: Array<string>,
    aClass: AClass, AClass: AClass, aRenamedClass: ARenamedClass,
    aClassWithGenerics: AClassWithGenerics<string>, aType: AType,
    otherClass: OtherClass, anotherClass: ReexportedOtherClass) {}
/**
 * @return {number}
 */
get w(): number {
    return 1;
  }
/**
 * Some comment
 */
@decorator
private x: number;
private y: number;

  @decorator
private z: AClass;
static decorators: {type: Function, args?: any[]}[] = [
{ type: classAnnotation },
];
/** @nocollapse */
static ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [
{type: Array, },
null,
null,
{type: Promise, },
{type: Array, },
{type: AClass, },
{type: AClass, },
{type: ARenamedClass, },
{type: AClassWithGenerics, },
null,
{type: OtherClass, },
{type: ReexportedOtherClass, },
];
static propDecorators: {[key: string]: {type: Function, args?: any[]}[]} = {
"w": [{ type: annotationDecorator },],
"y": [{ type: annotationDecorator },],
};
}

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

@classDecorator
class DecoratedClass {
  z: string;
}

function DecoratedClass_tsickle_Closure_declarations() {
/** @type {string} */
DecoratedClass.prototype.z;
}
