/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview Transformer to convert namespaces with nested
 * types into a form that the JSCompiler understands.
 */

import * as ts from 'typescript';

import {AnnotatorHost} from './annotator_host';
import {getIdentifierText, hasModifierFlag, isAmbient, markAsTransformedDeclMergeNs, reportDiagnostic} from './transformer_util';


/**
 * Transforms declaration merging namespaces.
 *
 * A (non-ambient) namespace NS that has the same name as a class OC adds all
 * its declarations to OC. Currently, only class and enum declarations inside NS
 * are supported. The declarations are renamed and hoisted to the file level. A
 * JSCompiler type alias property for each declaration in NS is added to class
 * OC. The alias introduces a qualified name for the inner class or enum. The
 * namespace is then eliminated so that tsickle does not generate an iife.
 *
 * Example:
 * class Outer { }
 * namespace Outer {
 *   export class InnerClass = { }
 *   export enum InnerEnum = { }
 * }
 *
 * The above is transformed into:
 *
 * class Outer { }
 * class Outer$InnerClass = { }
 * enum Outer$InnerEnum = { }
 * /** const * / Outer.InnerClass = Outer$InnerClass;  // JSCompiler type alias
 * /** const * / Outer.InnerEnum = Outer$InnerEnum;   // JSCompiler type alias
 *
 */
export function namespaceTransformer(
    host: AnnotatorHost, tsOptions: ts.CompilerOptions,
    typeChecker: ts.TypeChecker,
    diagnostics: ts.Diagnostic[]): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sourceFile: ts.SourceFile): ts.SourceFile => {
      let haveTransformedNs = false;
      let haveSeenError = false;
      const transformedStmts: ts.Statement[] = [];

      for (const stmt of sourceFile.statements) {
        visitTopLevelStatement(stmt);
      }
      if (!haveTransformedNs) {
        return sourceFile;
      }
      return ts.factory.updateSourceFile(
          sourceFile,
          ts.setTextRange(
              ts.factory.createNodeArray(transformedStmts),
              sourceFile.statements));

      // Local functions follow.

      // Namespace `ns` has the same name as `mergedClass`. Their declarations
      // are merged. Attaches the declarations defined in ns to mergedClass.
      // Returns the transformed module body statements, or [ns] if the
      // transformation fails.
      function transformNamespace(
          ns: ts.ModuleDeclaration,
          mergedClass: ts.ClassDeclaration): ts.Statement[] {
        if (!ns.body || !ts.isModuleBlock(ns.body)) {
          return [ns];
        }
        const nsName = getIdentifierText(ns.name as ts.Identifier);
        const transformedNsStmts: ts.Statement[] = [];
        for (const stmt of ns.body!.statements) {
          if (ts.isEmptyStatement(stmt)) continue;
          if (ts.isClassDeclaration(stmt)) {
            transformInnerClass(stmt);
          } else if (ts.isEnumDeclaration(stmt)) {
            transformInnerEnum(stmt);
          } else {
            error(
                stmt,
                `unsupported statement in declaration merging namespace '${
                    nsName}'`);
          }
        }
        if (haveSeenError) {
          // Drop the transformation.
          return [ns];
        }
        // The namespace is now essentially empty. All the declarations have
        // been hoisted out of it. Wrap it in a NotEmittedStatement to
        // prevent the compiler from emitting an iife.
        markAsTransformedDeclMergeNs(ns);
        haveTransformedNs = true;
        transformedNsStmts.push(ts.factory.createNotEmittedStatement(ns));
        return transformedNsStmts;

        // Local functions follow.

        function transformInnerClass(classDecl: ts.ClassDeclaration) {
          checkReferences(classDecl);
          checkIsExported(classDecl);
          if (!classDecl.name || !ts.isIdentifier(classDecl.name)) {
            error(classDecl, "Expected class name");
            return;
          }
          const className = getIdentifierText(classDecl.name);
          const hoistedClassName = `${nsName}$${className}`;
          const hoistedClassIdent =
              ts.factory.createIdentifier(hoistedClassName);
          // The hoisted class is not directly exported.
          const notExported = ts.factory.createModifiersFromModifierFlags(
              ts.getCombinedModifierFlags(classDecl) &
              (~ts.ModifierFlags.Export));
          const hoistedClassDecl = ts.factory.updateClassDeclaration(
              classDecl, classDecl.decorators, notExported, hoistedClassIdent,
              classDecl.typeParameters, classDecl.heritageClauses,
              classDecl.members);
          ts.setOriginalNode(hoistedClassDecl, classDecl);
          ts.setTextRange(hoistedClassDecl, classDecl);
          transformedNsStmts.push(hoistedClassDecl);
          // Add alias `/** @const */ nsName.className = hoistedClassName;`
          transformedNsStmts.push(
              createInnerNameAlias(className, hoistedClassIdent, classDecl));
        }

        function transformInnerEnum(enumDecl: ts.EnumDeclaration) {
          checkReferences(enumDecl);
          checkIsExported(enumDecl);
          // Hoist enum to top level and rename to ns$enumName.
          const enumName = getIdentifierText(enumDecl.name);
          const hoistedEnumName = `${nsName}$${enumName}`;
          const hoistedEnumIdent = ts.factory.createIdentifier(hoistedEnumName);
          // The hoisted enum is not directly exported.
          const notExported = ts.factory.createModifiersFromModifierFlags(
              ts.getCombinedModifierFlags(enumDecl) &
              (~ts.ModifierFlags.Export));
          const hoistedEnumDecl = ts.factory.updateEnumDeclaration(
              enumDecl, enumDecl.decorators, notExported, hoistedEnumIdent,
              enumDecl.members);
          ts.setOriginalNode(hoistedEnumDecl, enumDecl);
          ts.setTextRange(hoistedEnumDecl, enumDecl);
          transformedNsStmts.push(hoistedEnumDecl);
          // Add alias `/** @const */ nsName.enumName = hoistedEnumName;`
          transformedNsStmts.push(
              createInnerNameAlias(enumName, hoistedEnumIdent, enumDecl));
        }

        function createInnerNameAlias(
            propName: string, initializer: ts.Identifier,
            original: ts.Node): ts.Statement {
          const prop =
              ts.factory.createExpressionStatement(ts.factory.createAssignment(
                  ts.factory.createPropertyAccessExpression(
                      mergedClass.name!, propName),
                  initializer));
          ts.setTextRange(prop, original);
          ts.setOriginalNode(prop, original);
          return ts.addSyntheticLeadingComment(
              prop, ts.SyntaxKind.MultiLineCommentTrivia, '* @const ',
              /* hasTrailingNewLine */ true);
        }

        function checkIsExported(decl: ts.ClassDeclaration|ts.EnumDeclaration) {
          if (!hasModifierFlag(decl, ts.ModifierFlags.Export)) {
            error(decl, `'${getIdentifierText(decl.name!)}' must be exported`);
          }
        }

        function checkNamespaceRef(ref: ts.EntityName) {
          if (ts.isQualifiedName(ref)) {
            checkNamespaceRef(ref.left);
            return;
          }
          // ref is an unqulaified name. If it refers to a symbol that is
          // defined in the namespace, it is missing a qualifier.
          const sym = typeChecker.getSymbolAtLocation(ref);
          // Property 'parent' is marked @internal, need to cast to access.
          const parent = sym && (sym as {parent?: ts.Symbol}).parent;
          if (sym && parent &&
              ((parent.flags & ts.SymbolFlags.ValueModule) !== 0)) {
            const parentName = parent.getName();
            if (parentName === nsName) {
              // This identifier should be qualified with the parentName.
              const name = getIdentifierText(ref);
              error(
                  ref,
                  `Name '${name}' must be qualified as '${parentName}.${
                      name}'.`);
            }
          }
        }

        function checkReferences(node: ts.Node) {
          // Visitor function that ensures that all references to namespace
          // local symbols are properly qualified.
          // TODO: Are there other node types that need to be handled?
          function refCheckVisitor(node: ts.Node): ts.Node|undefined {
            if (ts.isTypeReferenceNode(node)) {
              checkNamespaceRef(node.typeName);
              return node;
            }
            if (ts.isPropertyAccessExpression(node)) {
              // We only need to look at the right side of the '.'
              return refCheckVisitor(node.expression);
            }
            if (!ts.isIdentifier(node)) {
              return ts.visitEachChild(node, refCheckVisitor, context);
            }
            // node is a ts.Identifier.
            if (node.parent &&
                (ts.isClassDeclaration(node.parent) ||
                 ts.isEnumDeclaration(node.parent))) {
              // Do not check the name of the class or enum declaration.
              return node;
            }
            checkNamespaceRef(node);
            return node;
          }
          ts.visitEachChild(node, refCheckVisitor, context);
        }
      }

      function visitTopLevelStatement(node: ts.Statement): void {
        if (!ts.isModuleDeclaration(node) || isAmbient(node)) {
          transformedStmts.push(node);
          return;
        }
        // Check if the namespace is merged with an existing class.
        const ns: ts.ModuleDeclaration = node;
        const sym = typeChecker.getSymbolAtLocation(ns.name);
        if (!sym || ns.name.kind === ts.SyntaxKind.StringLiteral) {
          // Must have a symbol name for declaration merging.
          transformedStmts.push(ns);
          return;
        }
        // For a merged namespace, the symbol must already have been declared
        // prior to the namespace declaration, or the compiler reports TS2434.
        const isMergedNs =
            sym.valueDeclaration && sym.valueDeclaration.pos !== ns.pos;
        if (!isMergedNs) {
          transformedStmts.push(ns);  // Nothing to do here.
          error(ns.name, 'transformation of plain namespace not supported.');
          return;
        }

        if (!ts.isClassDeclaration(sym.valueDeclaration!) ||
            isAmbient(sym.valueDeclaration)) {
          // The previous declaration is not a class.
          transformedStmts.push(ns);  // Nothing to do here.
          error(ns.name, 'declaration merging with non-class is not supported');
          return;
        }
        transformedStmts.push(...transformNamespace(ns, sym.valueDeclaration));
      }

      function error(node: ts.Node, message: string) {
        reportDiagnostic(diagnostics, node, message);
        haveSeenError = true;
      }
    };
  };
}
