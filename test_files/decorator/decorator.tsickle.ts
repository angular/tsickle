
/**
 * @param {!Object} a
 * @param {string} b
 * @return {void}
 */
function decorator(a: Object, b: string) {}
/**
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
/**
 * @param {?} t
 * @return {?}
 */
function classAnnotation(t: any) { return t; }


class DecoratorTest {
  @decorator
private x: number;
private y: number;
static decorators: DecoratorInvocation[] = [
{ type: classAnnotation },
];
/** @nocollapse */
static ctorParameters: () => ({type: any, decorators?: DecoratorInvocation[]}|null)[] = () => [
];
static propDecorators: {[key: string]: DecoratorInvocation[]} = {
'y': [{ type: annotationDecorator },],
};
}

function DecoratorTest_tsickle_Closure_declarations() {
 /** @type {!Array<!DecoratorInvocation>} */
DecoratorTest.decorators;
 /**
  * @nocollapse
  * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<!DecoratorInvocation>)})>}
  */
DecoratorTest.ctorParameters;
 /** @type {!Object<string,!Array<!DecoratorInvocation>>} */
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

/** @record */
function DecoratorInvocation() {}
 /** @type {!Function} */
DecoratorInvocation.prototype.type;
 /** @type {(undefined|!Array<?>)} */
DecoratorInvocation.prototype.args;


interface DecoratorInvocation {
  type: Function;
  args?: any[];
}
