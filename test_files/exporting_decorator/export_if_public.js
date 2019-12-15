/**
 * @fileoverview added by tsickle
 * Generated from: test_files/exporting_decorator/export_if_public.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.exporting_decorator.export_if_public');
var module = module || { id: 'test_files/exporting_decorator/export_if_public.ts' };
module = module;
const __tsickle_googReflect = goog.require("goog.reflect");
const tslib_1 = goog.require('tslib');
/**
 * \@ExportDecoratedItemsIfPublic
 * @return {function(*, (undefined|string|number|symbol)=): void}
 */
function exportDecoratedIfPublic() {
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
    ;
    /**
     * @protected
     * @return {void}
     */
    protectedMethod() {
    }
    ;
    /**
     * @private
     * @return {void}
     */
    privateMethod() {
    }
    ;
}
tslib_1.__decorate([
    exportDecoratedIfPublic(),
    tslib_1.__metadata("design:type", Object)
], ExportDecoratedClass.prototype, __tsickle_googReflect.objectProperty("implicitPublicProp", ExportDecoratedClass.prototype), void 0);
tslib_1.__decorate([
    exportDecoratedIfPublic(),
    tslib_1.__metadata("design:type", Object)
], ExportDecoratedClass.prototype, __tsickle_googReflect.objectProperty("publicProp", ExportDecoratedClass.prototype), void 0);
tslib_1.__decorate([
    exportDecoratedIfPublic(),
    tslib_1.__metadata("design:type", Object)
], ExportDecoratedClass.prototype, __tsickle_googReflect.objectProperty("protectedProp", ExportDecoratedClass.prototype), void 0);
tslib_1.__decorate([
    exportDecoratedIfPublic(),
    tslib_1.__metadata("design:type", Object)
], ExportDecoratedClass.prototype, __tsickle_googReflect.objectProperty("privateProp", ExportDecoratedClass.prototype), void 0);
tslib_1.__decorate([
    exportDecoratedIfPublic(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], ExportDecoratedClass.prototype, __tsickle_googReflect.objectProperty("implicitPublicMethod", ExportDecoratedClass.prototype), null);
tslib_1.__decorate([
    exportDecoratedIfPublic(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], ExportDecoratedClass.prototype, __tsickle_googReflect.objectProperty("publicMethod", ExportDecoratedClass.prototype), null);
tslib_1.__decorate([
    exportDecoratedIfPublic(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], ExportDecoratedClass.prototype, __tsickle_googReflect.objectProperty("protectedMethod", ExportDecoratedClass.prototype), null);
tslib_1.__decorate([
    exportDecoratedIfPublic(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], ExportDecoratedClass.prototype, __tsickle_googReflect.objectProperty("privateMethod", ExportDecoratedClass.prototype), null);
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
     * @protected
     */
    ExportDecoratedClass.prototype.protectedProp;
    /**
     * @type {number}
     * @private
     */
    ExportDecoratedClass.prototype.privateProp;
    /* Skipping unhandled member: ;*/
    /* Skipping unhandled member: ;*/
    /* Skipping unhandled member: ;*/
}
