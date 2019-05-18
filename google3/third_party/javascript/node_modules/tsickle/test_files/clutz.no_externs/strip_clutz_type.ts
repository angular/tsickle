import {ClutzedClass, clutzedFn} from 'goog:some.name.space';
import {TypeAlias} from 'goog:some.other';

let clutzedClass: ClutzedClass = new ClutzedClass();
console.log(clutzedClass);
let typeAliased: TypeAlias = clutzedClass.field;
clutzedFn(typeAliased);
