goog.module('test_files.export.export');var module = module || {id: 'test_files/export/export.js'};
var export_helper_1 = goog.require('test_files.export.export_helper');
exports.export2 = export_helper_1.export2;
exports.export5 = export_helper_1.export5;
exports.export4 = export_helper_1.export4;
// These conflict with an export discovered via the above exports,
// so the above export's versions should not show up.
exports.export1 = 'wins';
var export_helper_2 = export_helper_1;
exports.export3 = export_helper_2.export4;
// This local should be fine to export.
exports.exportLocal = 3;
// The existence of a local should not prevent "export2" from making
// it to the exports list.  export2 should only show up once in the
// above two "export *" lines, though.
let /** @type {number} */ export2 = 3;
