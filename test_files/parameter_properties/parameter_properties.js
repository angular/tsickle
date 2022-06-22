/**
 *
 * @fileoverview
 * Generated from: test_files/parameter_properties/parameter_properties.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.parameter_properties.parameter_properties');
var module = module || { id: 'test_files/parameter_properties/parameter_properties.ts' };
goog.require('tslib');
class ParamProps {
    // The @export below should not show up in the output ctor.
    /**
     * @public
     * @param {string} publicExportedP
     * @param {string} publicP
     * @param {string} protectedP
     * @param {string} privateP
     * @param {string} readonlyP
     * @param {string} publicReadonlyP
     */
    constructor(publicExportedP, publicP, protectedP, privateP, readonlyP, publicReadonlyP) {
        this.publicExportedP = publicExportedP;
        this.publicP = publicP;
        this.protectedP = protectedP;
        this.privateP = privateP;
        this.readonlyP = readonlyP;
        this.publicReadonlyP = publicReadonlyP;
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @export
     * @type {string}
     */
    ParamProps.prototype.publicExportedP;
    /**
     * @type {string}
     * @public
     */
    ParamProps.prototype.publicP;
    /**
     * @type {string}
     * @protected
     */
    ParamProps.prototype.protectedP;
    /**
     * @type {string}
     * @private
     */
    ParamProps.prototype.privateP;
    /**
     * @const {string}
     * @public
     */
    ParamProps.prototype.readonlyP;
    /**
     * @const {string}
     * @public
     */
    ParamProps.prototype.publicReadonlyP;
}
