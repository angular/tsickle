/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview Extern definitions for types missing in the Closure externs,
 * but used in TypeScript platform `.d.ts`.
 * @externs
 */

/** @typedef {!IArrayLike} */
var ArrayLike;

/** @typedef {!HTMLCollection} */
var HTMLCollectionOf;

/** @typedef {!HTMLTableCellElement} */
var HTMLTableDataCellElement;

/**
 * Does not have an equivalent in Closure's externs.
 * @typedef {!HTMLTableCellElement}
 */
var HTMLTableHeaderCellElement;

/**
 * Closure's NodeList is parameterized itself, there is no NodeListOf.
 * @constructor
 * @template T
 * @extends {NodeList<T>}
 */
var NodeListOf;

/**
 * Closure models this as a plain Array.
 * @typedef {!IArrayLike<string>|null}
 */
var RegExpExecArray;

/**
 * @record
 * @template T
 * @extends {IArrayLike<T>}
 */
function ReadonlyArray() {}

/**
 * @constructor
 * @template K, V
 * @extends {Map<K, V>}
 */
function ReadonlyMap() {}

/**
 * @constructor
 * @template T
 * @extends {Set<T>}
 */
function ReadonlySet() {}

/**
 * @record
 * @template T
 * @extends {IThenable<T>}
 */
function PromiseLike() {};

/** @typedef {function(new:Promise)} */
var PromiseConstructor;

/** @typedef {function(new:Promise, function(function(*=), function(*=)))} */
var PromiseConstructorLike;

/** @typedef {?} */
var SymbolConstructor;

