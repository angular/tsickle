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
 * @typedef {!NodeList}
 */
var NodeListOf;

/**
 * Closure models this as a plain Array.
 * @typedef {Array<string>|null}
 */
var RegExpExecArray;
