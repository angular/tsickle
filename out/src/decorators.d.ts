/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
/**
 * Returns the declarations for the given decorator.
 */
export declare function getDecoratorDeclarations(decorator: ts.Decorator, typeChecker: ts.TypeChecker): ts.Declaration[];
/**
 * Returns true if node has an exporting decorator  (i.e., a decorator with @ExportDecoratedItems
 * in its JSDoc).
 */
export declare function hasExportingDecorator(node: ts.Node, typeChecker: ts.TypeChecker): boolean | undefined;
/**
 * A transform pass that adds goog.reflect.objectProperty calls to the property
 * name string literals that are emitted as part of TypeScript's default
 * decorator output.
 *
 * goog.reflect.objectProperty is a special function that is recognized by
 * Closure Compiler. It is called like goog.reflect.objectProperty('prop', obj)
 * and it is compiled to a string literal that's the property named 'prop' on
 * the obj value.
 *
 * This way, runtime decorators can use the property names (e.g. to register
 * the property as a getter/setter pair) while still being compatible with
 * Closure Compiler's property renaming.
 *
 * Transforms:
 *
 *     tslib_1.__decorate([
 *       decorator,
 *       tslib_1.__metadata("design:type", Object)
 *     ], Foo.prototype, "prop", void 0);
 *
 * Into:
 *
 *     tslib_1.__decorate([
 *           decorator,
 *           tslib_1.__metadata("design:type", Object)
 *         ], Foo.prototype,
 *         __googReflect.objectProperty("prop", Foo.prototype), void 0);
 */
export declare function transformDecoratorsOutputForClosurePropertyRenaming(diagnostics: ts.Diagnostic[]): (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile>;
/**
 * A transformation pass that removes the annotations contained in
 * TAGS_CONFLICTING_WITH_DECORATE from toplevel statements of the form `ident =
 * tslib_1.__decorate(...)`.
 *
 * These call statements are generated for decorated classes and other
 * declarations. The leading comments of the declarations are cloned to the
 * `__decorate()` calls and may contain annotations that are not allowed in this
 * context and result in JSCompiler errors.
 */
export declare function transformDecoratorJsdoc(): ts.TransformerFactory<ts.SourceFile>;
