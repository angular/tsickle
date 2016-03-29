let typeAny: any;
let typeArr: Array<any> = null;
let typeArr2: any[] = null;
let typeNestedArr: {a:any}[][] = null;
let typeObject: {a:number, b:string} = {a:3, b:'b'};
let typeObject2: {[key:string]: number} = null;
let typeObject3: {a:number, [key:string]: number} = null;

let typeUnion: string|boolean = false;
let typeUnion2: (string|boolean) = false;
let typeOptionalField: {optional?: boolean} = {};
let typeOptionalUnion: {optional?: string|boolean} = {};
