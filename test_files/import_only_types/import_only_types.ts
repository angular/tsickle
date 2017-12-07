import {Foo} from './types_only';
// const enums count as types for the purpose of importing.
import {SomeInterface} from './types_and_constenum';

let x: Foo = {x: 'x'};
let y: SomeInterface = x;
console.log(y);
