goog.module('test_files.exporting_decorator.exporting');var module = module || {id: 'test_files/exporting_decorator/exporting.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */
/**
 * \@ExportDecoratedItems
 * @return {function(?, (string|symbol)): void}
 */
function exportingDecorator() {
    return function (target, name) { };
}
/**
 * @return {function(?, (string|symbol)): void}
 */
function nonExportingDecorator() {
    return function (target, name) { };
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
__decorate([
    exportingDecorator(),
    __metadata("design:type", Boolean)
], MyClass.prototype, "exportMe", void 0);
__decorate([
    nonExportingDecorator(),
    __metadata("design:type", Number)
], MyClass.prototype, "doNotExportMe", void 0);
__decorate([
    exportingDecorator(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MyClass.prototype, "exportThisOneToo", null);
__decorate([
    nonExportingDecorator(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MyClass.prototype, "doNotExportThisOneEither", null);
__decorate([
    exportingDecorator(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], MyClass.prototype, "exportThisGetter", null);
__decorate([
    exportingDecorator(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [Number])
], MyClass.prototype, "exportThisSetter", null);
__decorate([
    nonExportingDecorator(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], MyClass.prototype, "doNotExportThisGetter", null);
__decorate([
    nonExportingDecorator(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [Number])
], MyClass.prototype, "doNotExportThisSetter", null);
function MyClass_tsickle_Closure_declarations() {
    /** @type {boolean} */
    MyClass.prototype.exportMe;
    /** @type {number} */
    MyClass.prototype.doNotExportMe;
}
