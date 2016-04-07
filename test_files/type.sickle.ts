let /** @type {?} */ typeAny: any;
let /** @type {Array<?>} */ typeArr: Array<any> = null;
let /** @type {Array<?>} */ typeArr2: any[] = null;
let /** @type {Array<Array<{a: ?}>>} */ typeNestedArr: {a:any}[][] = null;
let /** @type {{a: number, b: string}} */ typeObject: {a:number, b:string} = {a:3, b:'b'};
let /** @type {Object<string,number>} */ typeObject2: {[key:string]: number} = null;
let /** @type {?} */ typeObject3: {a:number, [key:string]: number} = null;

let /** @type {(string|boolean)} */ typeUnion: string|boolean = false;
let /** @type {((string|boolean))} */ typeUnion2: (string|boolean) = false;
let /** @type {{optional: (boolean|undefined)}} */ typeOptionalField: {optional?: boolean} = {};
let /** @type {{optional: ((string|boolean)|undefined)}} */ typeOptionalUnion: {optional?: string|boolean} = {};

let /** @type {function(): void} */ typeFunc: () => void = function() {};
let /** @type {function(number, ?): string} */ typeFunc2: (a: number, b: any) => string = function(a, b) { return ''; };
let /** @type {function(number, function(number): string): string} */ typeFunc3: (x: number, callback: (x: number) => string) => string = function(x, cb) { return ''; }
// TODO: let typeFunc4: (a: number, ...args: number[]) => void;
