// test_files/cast_extends/cast_extends.ts(18,1): warning TS0: unhandled type flags: Intersection
// test_files/cast_extends/cast_extends.ts(24,10): warning TS0: unhandled type flags: Intersection
/**
 *
 * @fileoverview Reproduces an issue where tsickle would emit a cast for the
 * "extends" clause, and Closure would report an error due to the extends
 * expression not resolving to a plain identifier.
 * Generated from: test_files/cast_extends/cast_extends.ts
 * @suppress {checkTypes,uselessCode}
 *
 */
goog.module('test_files.cast_extends.cast_extends');
var module = module || { id: 'test_files/cast_extends/cast_extends.ts' };
goog.require('tslib');
class Someclass {
}
/**
 * @record
 */
function MixedIn() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    MixedIn.prototype.x;
}
/**
 * @record
 * @template T
 */
function Ctor() { }
exports.Ctor = Ctor;
/**
 * @template T
 * @param {!Ctor<T>} baseclazz
 * @return {!Ctor<?>}
 */
function mix(baseclazz) {
    // "baseclazz" must not be emitted as a cast, but as a direct identifier.
    /**
     * @extends {Someclass}
     * @implements {MixedIn}
     */
    class WithMixedIn extends baseclazz {
        constructor() {
            super(...arguments);
            this.x = 'mixed in';
        }
    }
    /* istanbul ignore if */
    if (false) {
        /**
         * @type {string}
         * @public
         */
        WithMixedIn.prototype.x;
    }
    return (/** @type {!Ctor<?>} */ ((/** @type {!Ctor<!Someclass>} */ (WithMixedIn))));
}
exports.mix = mix;
