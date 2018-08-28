// Ensure we still understand what Array is, even when it has been
// monkeypatched -- issue #170.
interface Array<T> {
  monkeyPatch: boolean;
}

let typeAny: any;
let typeArr: Array<any>;
let typeArr2: any[];
let typeNestedArr: {a:any}[][];

let typeObject: {a:number, b:string} = {a:3, b:'b'};
let typeObjectIndexable: {[key:string]: number};
let typeObjectMixedIndexProperty: {a:number, [key:string]: number};
let typeObjectEmpty: {};
let typeNonPrimitive: object;

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

interface MyRecord {
  b: string;
}

const typeIntersectionOfObjectTypes: {a: number}&{b: string} = {a: 42, b: 'b'};
let typeIntersectionWithRecordInterface: {a: number}&MyRecord = {a: 42, b: 'b'};
let typeIntersectionMixed1: {a: number}&number;
let typeIntersectionMixed2: string&number;
let typeIntersectionMixed3: {a: number}&Date;
let typeIntersectionMixed4: {a: number}&string[];
let typeIntersectionMixed5: {a: number}&{(): number} = Object.assign(() => 1, {a: 1});
