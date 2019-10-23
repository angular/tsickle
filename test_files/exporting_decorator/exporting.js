/**
 * @fileoverview added by tsickle
 * Generated from: test_files/exporting_decorator/exporting.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.exporting_decorator.exporting');
var module = module || { id: 'test_files/exporting_decorator/exporting.ts' };
module = module;
exports = {};
const tslib_1 = goog.require('tslib');
/**
 * \@ExportDecoratedItems
 * @return {function(?, (string|symbol)): void}
 */
function exportingDecorator() {
    return (/**
     * @param {?} target
     * @param {(string|symbol)} name
     * @return {void}
     */
    function (target, name) { });
}
/**
 * @return {function(?, (string|symbol)): void}
 */
function nonExportingDecorator() {
    return (/**
     * @param {?} target
     * @param {(string|symbol)} name
     * @return {void}
     */
    function (target, name) { });
}
class MyClass {
    /**
     * @export
     * @return {boolean}
     */
    exportThisOneToo() {
        return false;
    }
    /**
     * @return {number}
     */
    doNotExportThisOneEither() {
        return 42;
    }
    /**
     * @export
     * @return {number}
     */
    get exportThisGetter() {
        return 42;
    }
    /**
     * @export
     * @param {number} x
     * @return {void}
     */
    set exportThisSetter(x) {
        console.log(`I don't really care about ${x}.`);
    }
    /**
     * @return {number}
     */
    get doNotExportThisGetter() {
        return 42;
    }
    /**
     * @param {number} x
     * @return {void}
     */
    set doNotExportThisSetter(x) {
        console.log(`I don't really care about ${x}.`);
    }
}
tslib_1.__decorate([
    exportingDecorator(),
    tslib_1.__metadata("design:type", Boolean)
], MyClass.prototype, "exportMe", void 0);
tslib_1.__decorate([
    nonExportingDecorator(),
    tslib_1.__metadata("design:type", Number)
], MyClass.prototype, "doNotExportMe", void 0);
tslib_1.__decorate([
    exportingDecorator(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], MyClass.prototype, "exportThisOneToo", null);
tslib_1.__decorate([
    nonExportingDecorator(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], MyClass.prototype, "doNotExportThisOneEither", null);
tslib_1.__decorate([
    exportingDecorator(),
    tslib_1.__metadata("design:type", Object),
    tslib_1.__metadata("design:paramtypes", [])
], MyClass.prototype, "exportThisGetter", null);
tslib_1.__decorate([
    exportingDecorator(),
    tslib_1.__metadata("design:type", Number),
    tslib_1.__metadata("design:paramtypes", [Number])
], MyClass.prototype, "exportThisSetter", null);
tslib_1.__decorate([
    nonExportingDecorator(),
    tslib_1.__metadata("design:type", Object),
    tslib_1.__metadata("design:paramtypes", [])
], MyClass.prototype, "doNotExportThisGetter", null);
tslib_1.__decorate([
    nonExportingDecorator(),
    tslib_1.__metadata("design:type", Number),
    tslib_1.__metadata("design:paramtypes", [Number])
], MyClass.prototype, "doNotExportThisSetter", null);
if (false) {
    /**
     * @type {boolean}
     * @export
     */
    MyClass.prototype.exportMe;
    /** @type {number} */
    MyClass.prototype.doNotExportMe;
}
