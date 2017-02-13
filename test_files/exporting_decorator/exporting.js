goog.module('test_files.exporting_decorator.exporting');var module = module || {id: 'test_files/exporting_decorator/exporting.js'};/**
 * \@ExportDecoratedItems
 * @return {function(?): void}
 */
function exportingClassDecorator() {
    return function (target) { };
}
/**
 * @return {function(?): void}
 */
function nonExportingClassDecorator() {
    return function (target) { };
}
/**
 * \@ExportDecoratedItems
 * @return {function(?, (string|symbol)): void}
 */
function exportingFieldDecorator() {
    return function (target, name) { };
}
/**
 * @return {function(?, (string|symbol)): void}
 */
function nonExportingFieldDecorator() {
    return function (target, name) { };
}
let ExportedClass = class ExportedClass {
};
__decorate([
    exportingFieldDecorator(),
    __metadata("design:type", Boolean)
], ExportedClass.prototype, "exportMe", void 0);
__decorate([
    nonExportingFieldDecorator(),
    __metadata("design:type", Number)
], ExportedClass.prototype, "doNotExportMe", void 0);
ExportedClass = __decorate([
    exportingClassDecorator()
], ExportedClass);
function ExportedClass_tsickle_Closure_declarations() {
    /** @type {boolean} */
    ExportedClass.prototype.exportMe;
    /** @type {number} */
    ExportedClass.prototype.doNotExportMe;
}
let NonExportedClass = class NonExportedClass {
    /**
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
     * @return {number}
     */
    get exportThisGetter() {
        return 42;
    }
    /**
     * @param {number} x
     * @return {void}
     */
    set exportThisSetter(x) {
        console.log(`I don't really care about ${x}.`);
    }
};
__decorate([
    exportingFieldDecorator(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NonExportedClass.prototype, "exportThisOneToo", null);
__decorate([
    nonExportingFieldDecorator(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NonExportedClass.prototype, "doNotExportThisOneEither", null);
__decorate([
    exportingFieldDecorator(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NonExportedClass.prototype, "exportThisGetter", null);
__decorate([
    exportingFieldDecorator(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [Number])
], NonExportedClass.prototype, "exportThisSetter", null);
NonExportedClass = __decorate([
    nonExportingClassDecorator()
], NonExportedClass);
