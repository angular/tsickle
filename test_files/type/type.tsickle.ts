Warning at test_files/type/type.ts:14:5: unhandled type literal
Warning at test_files/type/type.ts:15:5: symbol has no declarations
====
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */


// Ensure we still understand what Array is, even when it has been
// monkeypatched -- issue #170.
interface Array<T> {
  monkeyPatch: boolean;
}

let /** @type {?} */ typeAny: any;
let /** @type {!Array<?>} */ typeArr: Array<any>;
let /** @type {!Array<?>} */ typeArr2: any[];
let /** @type {!Array<!Array<{a: ?}>>} */ typeNestedArr: {a:any}[][];

let /** @type {{a: number, b: string}} */ typeObject: {a:number, b:string} = {a:3, b:'b'};
let /** @type {!Object<string,number>} */ typeObject2: {[key:string]: number};
let /** @type {?} */ typeObject3: {a:number, [key:string]: number};
let /** @type {?} */ typeObjectEmpty: {};

let /** @type {!Array<?>} */ typeTuple: [number, number] = [1, 2];
let /** @type {!Array<?>} */ typeComplexTuple: [string, true|{a:string}] = ['', true];
let /** @type {!Array<?>} */ typeTupleTuple: [[number, number]] = [[1, 2]];
let /** @type {!Array<?>} */ typeTupleTuple2: [[number, number], string] = [[1, 2], ''];

let /** @type {(string|boolean)} */ typeUnion: string|boolean = Math.random() > 0.5 ? false : '';
let /** @type {(string|boolean)} */ typeUnion2: (string|boolean) = Math.random() > 0.5 ? false : '';
let /** @type {{optional: (undefined|boolean)}} */ typeOptionalField: {optional?: boolean} = {};
let /** @type {{optional: (undefined|string|boolean)}} */ typeOptionalUnion: {optional?: string|boolean} = {};

let /** @type {function(): void} */ typeFunc: () => void = function() {};
let /** @type {function(number, ?): string} */ typeFunc2: (a: number, b: any) => string = function(a, b) { return ''; };
let /** @type {function(number, function(number): string): string} */ typeFunc3: (x: number, callback: (x: number) => string) => string = function(x, cb) { return ''; }
/**
 * @param {function(number): number} callback
 * @return {void}
 */
function typeCallback(callback: (val: number) => number) { }
typeCallback(val => val + 1);
/**
 * @template T
 * @param {function(T): T} callback
 * @return {void}
 */
function typeGenericCallback<T>(callback: (val: T) => T) { }
typeGenericCallback(val => val);
