/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */


export {export2,Bar,export5,RenamedTypeDef,export4,TypeDef,Interface} from './export_helper';
const tsickle_forward_declare_1 = goog.forwardDeclare('test_files.export.export_helper');
/** @typedef {tsickle_forward_declare_1.TypeDef} */
exports.RenamedTypeDef; // re-export typedef
/** @typedef {tsickle_forward_declare_1.TypeDef} */
exports.TypeDef; // re-export typedef
export {} from './export_helper_2';
const tsickle_forward_declare_2 = goog.forwardDeclare('test_files.export.export_helper_2');

// These conflict with an export discovered via the above exports,
// so the above export's versions should not show up.
export var /** @type {string} */ export1: string = 'wins';
export {export4 as export3} from './export_helper';
const tsickle_forward_declare_3 = goog.forwardDeclare('test_files.export.export_helper');

// This local should be fine to export.
export var /** @type {number} */ exportLocal = 3;

// The existence of a local should not prevent "export2" from making
// it to the exports list.  export2 should only show up once in the
// above two "export *" lines, though.
let /** @type {number} */ export2 = 3;

// This is just an import, so export5 should still be included.
import {export5} from './export_helper';
const tsickle_forward_declare_4 = goog.forwardDeclare('test_files.export.export_helper');

export {TypeAndValue} from './type_and_value';
const tsickle_forward_declare_5 = goog.forwardDeclare('test_files.export.type_and_value');
