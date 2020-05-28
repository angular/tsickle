/**
 * @fileoverview added by tsickle
 * Generated from: test_files/exporting_decorator/exporting.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.exporting_decorator.exporting');
var module = module || { id: 'test_files/exporting_decorator/exporting.ts' };
module = module;
const __tsickle_googReflect = goog.require("goog.reflect");
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
], MyClass.prototype, __tsickle_googReflect.objectProperty("exportMe", MyClass.prototype), void 0);
tslib_1.__decorate([
    nonExportingDecorator(),
    tslib_1.__metadata("design:type", Number)
], MyClass.prototype, __tsickle_googReflect.objectProperty("doNotExportMe", MyClass.prototype), void 0);
tslib_1.__decorate([
    exportingDecorator(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], MyClass.prototype, __tsickle_googReflect.objectProperty("exportThisOneToo", MyClass.prototype), null);
tslib_1.__decorate([
    nonExportingDecorator(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], MyClass.prototype, __tsickle_googReflect.objectProperty("doNotExportThisOneEither", MyClass.prototype), null);
tslib_1.__decorate([
    exportingDecorator(),
    tslib_1.__metadata("design:type", Object),
    tslib_1.__metadata("design:paramtypes", [])
], MyClass.prototype, __tsickle_googReflect.objectProperty("exportThisGetter", MyClass.prototype), null);
tslib_1.__decorate([
    exportingDecorator(),
    tslib_1.__metadata("design:type", Number),
    tslib_1.__metadata("design:paramtypes", [Number])
], MyClass.prototype, __tsickle_googReflect.objectProperty("exportThisSetter", MyClass.prototype), null);
tslib_1.__decorate([
    nonExportingDecorator(),
    tslib_1.__metadata("design:type", Object),
    tslib_1.__metadata("design:paramtypes", [])
], MyClass.prototype, __tsickle_googReflect.objectProperty("doNotExportThisGetter", MyClass.prototype), null);
tslib_1.__decorate([
    nonExportingDecorator(),
    tslib_1.__metadata("design:type", Number),
    tslib_1.__metadata("design:paramtypes", [Number])
], MyClass.prototype, __tsickle_googReflect.objectProperty("doNotExportThisSetter", MyClass.prototype), null);
if (false) {
    /**
     * @type {boolean}
     * @export
     */
    MyClass.prototype.exportMe;
    /** @type {number} */
    MyClass.prototype.doNotExportMe;
}
