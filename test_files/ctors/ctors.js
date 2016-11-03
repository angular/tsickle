goog.module('test_files.ctors.ctors');var module = module || {id: 'test_files/ctors/ctors.js'};let /** @type {function(new: Document): ?} */ x = Document;
class X {
    /**
     * @param {number} a
     */
    constructor(a) {
        this.a = a;
    }
}
// tsickle type annotations
/** @type {number} */
X.prototype.a;
let /** @type {function(new: X, number): ?} */ y = X;
