// test_files/mapped/mapped.ts(20,3): warning TS0: handle unnamed member:
// [fancySymbol]: BagProperties;
// test_files/mapped/mapped.ts(21,3): warning TS0: handle unnamed member:
// [FancyEnum.RED]: boolean;
// test_files/mapped/mapped.ts(36,1): warning TS0: omitting inexpressible
// property name: __@fancySymbol@5876 test_files/mapped/mapped.ts(36,1): warning
// TS0: omitting inexpressible property name: 1
// test_files/mapped/mapped.ts(43,1): warning TS0: omitting inexpressible
// property name: __@fancySymbol@5876 test_files/mapped/mapped.ts(43,1): warning
// TS0: omitting inexpressible property name: 1
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/mapped/mapped.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode}
 * checked by tsc
 */
goog.module('test_files.mapped.mapped');
var module = module || {id: 'test_files/mapped/mapped.ts'};
goog.require('tslib');
/**
 * @record
 */
function NoProperties() {}
/**
 * @record
 */
function BasicProperties() {}
/* istanbul ignore if */
if (false) {
  /** @type {string} */
  BasicProperties.prototype.cat;
  /** @type {number} */
  BasicProperties.prototype.count;
}
/**
 * @record
 */
function BagProperties() {}
/** @enum {number} */
const FancyEnum = {
  RED: 1,
};
FancyEnum[FancyEnum.RED] = 'RED';
/** @type {symbol} */
const fancySymbol = Symbol();
/**
 * @record
 */
function FancyProperties() {}
/* istanbul ignore if */
if (false) {
  /** @type {!BasicProperties} */
  FancyProperties.prototype.nested;
  /* Skipping unnamed member:
  [fancySymbol]: BagProperties;*/
  /* Skipping unnamed member:
  [FancyEnum.RED]: boolean;*/
  /* Skipping unhandled member: new(): FancyProperties;*/
  /* Skipping unhandled member: (): void;*/
  /**
   * @return {!Iterable<string>}
   */
  FancyProperties.prototype[Symbol.iterator] = function() {};
}
/** @typedef {*} */
var MappedNo;
/** @typedef {{cat: boolean, count: boolean}} */
var MappedBasic;
/** @typedef {!Object<string,boolean>} */
var MappedBag;
/** @typedef {{nested: function(number): string}} */
var MappedFancy;
/** @typedef {*} */
var PartialNo;
/** @typedef {{cat: (undefined|string), count: (undefined|number)}} */
var PartialBasic;
/** @typedef {!Object<string,(undefined|boolean)>} */
var PartialBag;
/** @typedef {{nested: (undefined|!BasicProperties)}} */
var PartialFancy;
/** @typedef {{cat: string, count: number}} */
var NotProperlyHandledReadonly;
