/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */


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
  @decorator
private x: number;
private y: number;
static decorators: {type: Function, args?: any[]}[] = [
{ type: classAnnotation },
];
/** @nocollapse */
static ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [
];
static propDecorators: {[key: string]: {type: Function, args?: any[]}[]} = {
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
/** @type {number} */
DecoratorTest.prototype.x;
/** @type {number} */
DecoratorTest.prototype.y;
}

@classDecorator
class DecoratedClass {
  z: string;
}

function DecoratedClass_tsickle_Closure_declarations() {
/** @type {string} */
DecoratedClass.prototype.z;
}

