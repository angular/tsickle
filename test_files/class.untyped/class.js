goog.module('test_files.class.untyped.class');var module = module || {id: 'test_files/class.untyped/class.js'};class Super {
    /**
     * @return {?}
     */
    superFunc() { }
}
class Implements {
    /**
     * @return {?}
     */
    interfaceFunc() { }
    /**
     * @return {?}
     */
    superFunc() { }
}
class Extends extends Super {
    /**
     * @return {?}
     */
    interfaceFunc() { }
}
// Verify Closure accepts the various casts.
let /** @type {?} */ interfaceVar;
interfaceVar = new Implements();
interfaceVar = new Extends();
let /** @type {?} */ superVar;
superVar = new Implements();
superVar = new Extends();
