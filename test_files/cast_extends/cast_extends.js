// test_files/cast_extends/cast_extends.ts(17,1): warning TS0: unhandled type flags: Intersection
// test_files/cast_extends/cast_extends.ts(23,10): warning TS0: unhandled type flags: Intersection
/**
 *
 * @fileoverview Reproduces an issue where tsickle would emit a cast for the "extends" claus, and
 * Closure would report an error due to the extends expression not resolving to a plain identifier.
 *
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.cast_extends.cast_extends');
var module = module || { id: 'test_files/cast_extends/cast_extends.ts' };
module = module;
exports = {};
class Someclass {
}
/**
 * @record
 */
function MixedIn() { }
if (false) {
    /** @type {string} */
    MixedIn.prototype.x;
}
/**
 * @record
 * @template T
 */
function Ctor() { }
exports.Ctor = Ctor;
if (false) {
    /** @type {T} */
    Ctor.prototype.prototype;
    /* Skipping unhandled member: new(...args: Array<{}>): T;*/
}
/**
 * @template T
 * @param {!Ctor<T>} baseclazz
 * @return {!Ctor<?>}
 */
function mix(baseclazz) {
    // "baseclazz" must not be emitted as a cast, but as a direct identifier.
    /**
     * @implements {MixedIn}
     */
    class WithMixedIn extends baseclazz {
        constructor() {
            super(...arguments);
            this.x = 'mixed in';
        }
    }
    if (false) {
        /** @type {string} */
        WithMixedIn.prototype.x;
    }
    return (/** @type {!Ctor<?>} */ ((/** @type {!Ctor<!Someclass>} */ (WithMixedIn))));
}
exports.mix = mix;
