goog.module('test_files.class.class');var module = module || {id: 'test_files/class/class.js'};/** @record */
function Interface() { }
/** @type {function(): void} */
Interface.prototype.interfaceFunc;
class Super {
    /**
     * @return {void}
     */
    superFunc() { }
}
/**
 * @implements {Interface}
 * @extends {Super}
 */
class Implements {
    /**
     * @return {void}
     */
    interfaceFunc() { }
    /**
     * @return {void}
     */
    superFunc() { }
}
/**
 * @implements {Interface}
 */
class Extends extends Super {
    /**
     * @return {void}
     */
    interfaceFunc() { }
}
// Verify Closure accepts the various casts.
let /** @type {!Interface} */ interfaceVar;
interfaceVar = new Implements();
interfaceVar = new Extends();
let /** @type {!Super} */ superVar;
superVar = new Implements();
superVar = new Extends();
