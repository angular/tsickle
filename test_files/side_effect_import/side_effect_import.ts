/**
 * @fileoverview Use some side-effect imports and verify that tsickle generates
 * proper module code from them.
 */

// tslint:disable

import './module1';
import './module2';

import {Mod1} from './module1';
import {Mod2} from './module2';

// Use one as a type and the other as a value.
let x = new Mod1();
let y: Mod2;
