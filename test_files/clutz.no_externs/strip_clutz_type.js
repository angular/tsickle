/**
 * @fileoverview added by tsickle
 * Generated from: test_files/clutz.no_externs/strip_clutz_type.ts
 */
goog.module('test_files.clutz.no_externs.strip_clutz_type');
var module = module || { id: 'test_files/clutz.no_externs/strip_clutz_type.ts' };
goog.require('tslib');
const tsickle_space_1 = goog.requireType("some.name.space");
const tsickle_other_2 = goog.requireType("some.other");
const goog_some_name_space_1 = goog.require('some.name.space');
/** @type {!tsickle_space_1.ClutzedClass} */
let clutzedClass = new goog_some_name_space_1.ClutzedClass();
console.log(clutzedClass);
/** @type {!tsickle_other_2.ClutzedInterface} */
let typeAliased = clutzedClass.field;
(0, goog_some_name_space_1.clutzedFn)(typeAliased);
