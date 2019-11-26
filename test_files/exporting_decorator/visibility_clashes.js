// test_files/exporting_decorator/visibility_clashes.ts(11,3): error TS0: A field may not be protected and use a decorator annotated with @ExportsDecoratedItems.
// test_files/exporting_decorator/visibility_clashes.ts(12,3): error TS0: A field may not be private and use a decorator annotated with @ExportsDecoratedItems.
// test_files/exporting_decorator/visibility_clashes.ts(20,3): error TS0: A field may not be protected and use a decorator annotated with @ExportsDecoratedItems.
// test_files/exporting_decorator/visibility_clashes.ts(23,3): error TS0: A field may not be private and use a decorator annotated with @ExportsDecoratedItems.
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/exporting_decorator/visibility_clashes.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.exporting_decorator.visibility_clashes');
var module = module || { id: 'test_files/exporting_decorator/visibility_clashes.ts' };
module = module;
const tslib_1 = goog.require('tslib');
/**
 * \@ExportDecoratedItems
 * @return {function(*, (undefined|string|number|symbol)=): void}
 */
function exportDecorated() {
    return (/**
     * @param {*} protoOrDescriptor
     * @param {(undefined|string|number|symbol)=} name
     * @return {void}
     */
    (protoOrDescriptor, name) => { });
}
class ExportDecoratedClass {
    constructor() {
        this.implicitPublicProp = 0;
        this.publicProp = 0;
        this.protectedProp = 0;
        this.privateProp = 0;
    }
    /**
     * @export
     * @return {void}
     */
    implicitPublicMethod() {
    }
    /**
     * @export
     * @return {void}
     */
    publicMethod() {
    }
    /**
     * @export
     * @return {void}
     */
    protectedMethod() {
    }
    /**
     * @export
     * @return {void}
     */
    privateMethod() {
    }
}
tslib_1.__decorate([
    exportDecorated(),
    tslib_1.__metadata("design:type", Object)
], ExportDecoratedClass.prototype, "implicitPublicProp", void 0);
tslib_1.__decorate([
    exportDecorated(),
    tslib_1.__metadata("design:type", Object)
], ExportDecoratedClass.prototype, "publicProp", void 0);
tslib_1.__decorate([
    exportDecorated(),
    tslib_1.__metadata("design:type", Object)
], ExportDecoratedClass.prototype, "protectedProp", void 0);
tslib_1.__decorate([
    exportDecorated(),
    tslib_1.__metadata("design:type", Object)
], ExportDecoratedClass.prototype, "privateProp", void 0);
tslib_1.__decorate([
    exportDecorated(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], ExportDecoratedClass.prototype, "implicitPublicMethod", null);
tslib_1.__decorate([
    exportDecorated(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], ExportDecoratedClass.prototype, "publicMethod", null);
tslib_1.__decorate([
    exportDecorated(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], ExportDecoratedClass.prototype, "protectedMethod", null);
tslib_1.__decorate([
    exportDecorated(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], ExportDecoratedClass.prototype, "privateMethod", null);
if (false) {
    /**
     * @type {number}
     * @export
     */
    ExportDecoratedClass.prototype.implicitPublicProp;
    /**
     * @type {number}
     * @export
     */
    ExportDecoratedClass.prototype.publicProp;
    /**
     * @type {number}
     * @export
     */
    ExportDecoratedClass.prototype.protectedProp;
    /**
     * @type {number}
     * @export
     */
    ExportDecoratedClass.prototype.privateProp;
}
