/**
 *
 * @fileoverview Use some side-effect imports and verify that tsickle generates
 * proper module code from them.
 *
 * Generated from: test_files/side_effect_import/side_effect_import.ts
 */
// tslint:disable
goog.module('test_files.side_effect_import.side_effect_import');
var module = module || { id: 'test_files/side_effect_import/side_effect_import.ts' };
goog.require('tslib');
const tsickle_module1_1 = goog.requireType("test_files.side_effect_import.module1");
const tsickle_module2_2 = goog.requireType("test_files.side_effect_import.module2");
goog.require('test_files.side_effect_import.module1');
goog.require('test_files.side_effect_import.module2');
const module1_1 = goog.require('test_files.side_effect_import.module1');
// Use one as a type and the other as a value.
/** @type {!tsickle_module1_1.Mod1} */
let x = new module1_1.Mod1();
/** @type {!tsickle_module2_2.Mod2} */
let y;
