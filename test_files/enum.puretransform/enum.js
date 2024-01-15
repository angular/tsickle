/**
 * @fileoverview Test devmode (i.e. no JSDoc or special enum transformer) emit
 * for enum merged with namespace.
 * @suppress {missingProperties}
 */
goog.module('test_files.enum.puretransform.enum');
var module = module || { id: 'test_files/enum.puretransform/enum.ts' };
goog.require('tslib');
var E;
(function (E) {
    E[E["e0"] = 0] = "e0";
    E[E["e1"] = 1] = "e1";
    E[E["e2"] = 2] = "e2";
})(E || (E = {}));
exports.E = E;
(function (E) {
    function fromString(s) {
        return E.e0;
    }
    E.fromString = fromString;
})(E || (E = {}));
