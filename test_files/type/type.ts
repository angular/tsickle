export {};

// Ensure we still understand what Array is, even when it has been
// monkeypatched -- issue #170.
declare global {
  interface Array<T> {
    monkeyPatch: boolean;
  }
}

let typeAny: any;
let typeArr: Array<any>;
let typeArr2: any[];
let typeNestedArr: {a:any}[][];
let typeUnknown: unknown;
let typeBigInt: bigint;

let typeBooleanLiteral: false;
let typeNumberLiteral: 0;
let typeStringLiteral: '';
let typeBigIntLiteral: 0n;

let typeObject: {a:number, b:string} = {a:3, b:'b'};
let typeObjectIndexable: {[key:string]: number};
let typeObjectMixedIndexProperty: {a:number, [key:string]: number};
let typeObjectEmpty: {};
let typeNonPrimitive: object;

// Verify assignability into these supertypes.
typeObjectEmpty = 1;
typeObjectEmpty = 'a';
typeObjectEmpty = new Date();
typeObjectEmpty = {};
typeNonPrimitive = {};
typeNonPrimitive = new Date();

let typeTuple: [number, number] = [1, 2];
let typeComplexTuple: [string, true|{a:string}] = ['', true];
let typeTupleTuple: [[number, number]] = [[1, 2]];
let typeTupleTuple2: [[number, number], string] = [[1, 2], ''];

let typeUnion: string|boolean = Math.random() > 0.5 ? false : '';
let typeUnion2: (string|boolean) = Math.random() > 0.5 ? false : '';
let typeOptionalField: {optional?: boolean} = {};
let typeOptionalUnion: {optional?: string|boolean} = {};

let typeFunc: () => void = function() {};
let typeFunc2: (a: number, b: any) => string = function(a, b) { return ''; };
let typeFunc3: (x: number, callback: (x: number) => string) => string = function(x, cb) { return ''; };
let typeFuncOptionalArg: (a: number, b?: {}) => string;
let typeFuncVarArgs: (a: number, ...args: number[]) => void;

function typeCallback(callback: (val: number) => number) { }
typeCallback(val => val + 1);
function typeGenericCallback<T>(callback: (val: T) => T) { }
typeGenericCallback(val => val);

type ConstructorObj = new (a: number, b: {}) => {};
type ConstructorUnknown = new (...args: unknown[]) => unknown;
