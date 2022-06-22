/**
 *
 * @fileoverview This test checks that tsickle breaks out of recursive type
 * definitions where the type being declared is used as a type parameter.
 * Generated from: test_files/recursive_alias/recursive_alias.ts
 * @suppress {uselessCode}
 *
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
    /**
     * @type {(undefined|!Tree)}
     * @public
     */
    Tree.prototype.child;
}
/**
 * @record
 * @template T
 */
function Node() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {T}
     * @public
     */
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
    /**
     * @type {(undefined|!NodeTreeInline)}
     * @public
     */
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
    /**
     * @type {A}
     * @public
     */
    Pair.prototype.a;
    /**
     * @type {B}
     * @public
     */
    Pair.prototype.b;
}
/** @typedef {!Pair<!Tree<number>, !Tree<number>>} */
var PairOfTrees;
