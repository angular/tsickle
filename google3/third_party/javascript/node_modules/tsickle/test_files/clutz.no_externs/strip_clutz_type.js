/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.clutz.no_externs.strip_clutz_type');
var module = module || { id: 'test_files/clutz.no_externs/strip_clutz_type.ts' };
module = module;
exports = {};
const tsickle_space_1 = goog.requireType("some.name.space");
const tsickle_other_2 = goog.requireType("some.other");
const goog_some_name_space_1 = goog.require('some.name.space');
/** @type {!tsickle_space_1.ClutzedClass} */
let clutzedClass = new goog_some_name_space_1.ClutzedClass();
console.log(clutzedClass);
/** @type {!tsickle_other_2.ClutzedInterface} */
let typeAliased = clutzedClass.field;
goog_some_name_space_1.clutzedFn(typeAliased);
