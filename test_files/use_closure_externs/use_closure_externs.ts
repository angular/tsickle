/**
 * @fileoverview A source file that uses types that are used in .d.ts files, but
 * that are not available or use different names in Closure's externs.
 */

console.log('work around TS dropping consecutive comments');

let x: NodeListOf<HTMLParagraphElement> = document.getElementsByTagName('p');
console.log(x);

const res: RegExpExecArray|null = /asd/.exec('asd asd')!;
console.log(res);
