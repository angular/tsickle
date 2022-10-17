// test_files/decl_merge/inner_class.ts(49,7): warning TS0: anonymous type has no symbol
// test_files/decl_merge/inner_class.ts(51,13): warning TS0: anonymous type has no symbol
/**
 *
 * @fileoverview Ensure inner classes defined with declaration merging
 *   are properly transformed and hoisted out of the namespace, and
 *   no iife is created for the namespace.
 *
 * Generated from: test_files/decl_merge/inner_class.ts
 * @suppress {uselessCode,checkTypes}
 *
 */
goog.module('test_files.decl_merge.inner_class');
var module = module || { id: 'test_files/decl_merge/inner_class.ts' };
goog.require('tslib');
class SomeClass {
    /**
     * @public
     * @param {!SomeClass.Inner} i
     * @return {null}
     */
    foolMeOnce(i) {
        return null;
    }
}
exports.SomeClass = SomeClass;
class SomeClass$Inner {
}
/** @const */
SomeClass.Inner = SomeClass$Inner;
/**
 * @extends {SomeClass.Inner}
 */
class SomeClass$Another extends SomeClass.Inner {
    /**
     * @public
     * @param {!SomeClass.Inner} i
     * @return {null}
     */
    foolMeTwice(i) {
        return null;
    }
}
/** @const */
SomeClass.Another = SomeClass$Another;
/** @type {!SomeClass.Inner} */
let some;
// Check that all unqualified references to symbols in X automatically
// get qualified with the namespace name X.
class X {
    /**
     * @public
     * @param {!X.E} b
     * @return {(null|!X.E)}
     */
    bar(b) {
        return b === X.E.A ? X.E.B : null;
    }
}
/** @enum {number} */
const X$E = {
    A: 0, B: 1,
};
X$E[X$E.A] = 'A';
X$E[X$E.B] = 'B';
/** @const */
X.E = X$E;
class X$Y {
    constructor() {
        this.a = X.E.A;
        this.b = X.E.B;
        this.y = new X.Y();
    }
    /**
     * @public
     * @param {(string|!X.E)} e
     * @return {!X.E}
     */
    foo(e) {
        return X.E.B;
    }
    /**
     * @public
     * @template W
     * @param {!X} x
     * @return {(null|!X.E)}
     */
    bar(x) {
        /** @typedef {function(!X.E): !X.E} */
        var T;
        /** @typedef {?} */
        var S;
        /** @type {string} */
        const U = typeof X.E;
        /** @type {?} */
        const V = X.E;
        return x.bar(X.E.A);
    }
    /**
     * @public
     * @return {!X.Y}
     */
    baz() {
        return new X.Y();
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {!X.E}
     * @public
     */
    X$Y.prototype.a;
    /**
     * @type {!X.E}
     * @public
     */
    X$Y.prototype.b;
    /**
     * @type {!X.Y}
     * @public
     */
    X$Y.prototype.y;
}
/** @const */
X.Y = X$Y;
/**
 * @extends {X.Y}
 */
class X$Z extends X.Y {
}
/** @const */
X.Z = X$Z;
