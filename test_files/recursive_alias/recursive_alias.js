/**
 *
 * @fileoverview This test checks that tsickle breaks out of recursive type
 * definitions where the type being declared is used as a type parameter.
 *
 * Generated from: test_files/recursive_alias/recursive_alias.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.recursive_alias.recursive_alias');
var module = module || { id: 'test_files/recursive_alias/recursive_alias.ts' };
goog.require('tslib');
/**
 * @record
 * @template T
 */
function Tree() { }
/* istanbul ignore if */
if (false) {
    /** @type {(undefined|!Tree)} */
    Tree.prototype.child;
}
/**
 * @record
 * @template T
 */
function Node() { }
/* istanbul ignore if */
if (false) {
    /** @type {T} */
    Node.prototype.value;
}
/** @typedef {!Tree<?>} */
var NumberTree;
/** @typedef {!Tree<!Node<?>>} */
var NumberNodeTree;
/**
 * @record
 */
function NodeTreeInline() { }
/* istanbul ignore if */
if (false) {
    /** @type {(undefined|!NodeTreeInline)} */
    NodeTreeInline.prototype.child;
}
/** @typedef {{child: (undefined|?)}} */
var NodeTreeAliasInline;
/** @typedef {!Tree<!Tree<number>>} */
var NodeTreeTree;
/**
 * @record
 * @template A, B
 */
function Pair() { }
/* istanbul ignore if */
if (false) {
    /** @type {A} */
    Pair.prototype.a;
    /** @type {B} */
    Pair.prototype.b;
}
/** @typedef {!Pair<!Tree<number>, !Tree<number>>} */
var PairOfTrees;
