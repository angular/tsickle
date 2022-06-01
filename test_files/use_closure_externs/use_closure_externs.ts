/**
 * @fileoverview A source file that uses types that are used in .d.ts files, but
 * that are not available or use different names in Closure's externs.
 * @suppress {checkTypes}
 */

let x: NodeListOf<HTMLElement> = document.getElementsByName('p');
console.log(x);

const res: RegExpExecArray|null = /asd/.exec('asd asd')!;
console.log(res);
let a: ReadonlyArray<string> = [''];
let m: ReadonlyMap<string, string> = new Map();
let s: ReadonlySet<string> = new Set();

export {};
