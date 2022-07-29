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
import {getIdentifierText, hasModifierFlag, isAmbient, markAsMergedDeclaration, reportDiagnostic} from './transformer_util';

/**
 * Returns first non-ambient declaration of given symbol before textual position
 * of 'ns'.
 */
function getPreviousDeclaration(
    sym: ts.Symbol, ns: ts.ModuleDeclaration): ts.Declaration|null {
  if (!sym.declarations) return null;
  const sf = ns.getSourceFile();
  for (const decl of sym.declarations) {
    if (!isAmbient(decl) && (decl.getSourceFile()) === sf &&
        (decl.pos < ns.pos)) {
      return decl;
    }
  }
  return null;
}

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

      // Namespace `ns` has the same name as `mergedDecl`. Their declarations
      // are merged. Attaches the declarations defined in ns to mergedDecl.
      // Returns the transformed module body statements, or [ns] if the
      // transformation fails.
      function transformNamespace(
          ns: ts.ModuleDeclaration,
          mergedDecl: ts.ClassDeclaration|
          ts.InterfaceDeclaration): ts.Statement[] {
        if (!ns.body || !ts.isModuleBlock(ns.body)) {
          return [ns];
        }
        const nsName = getIdentifierText(ns.name as ts.Identifier);
        const transformedNsStmts: ts.Statement[] = [];
        for (const stmt of ns.body!.statements) {
          if (ts.isEmptyStatement(stmt)) continue;
          if (ts.isClassDeclaration(stmt)) {
            transformInnerDeclaration(
                stmt, (classDecl, notExported, hoistedIdent) => {
                  return ts.factory.updateClassDeclaration(
                      classDecl, classDecl.decorators, notExported,
                      hoistedIdent, classDecl.typeParameters,
                      classDecl.heritageClauses, classDecl.members);
                });
          } else if (ts.isEnumDeclaration(stmt)) {
            transformInnerDeclaration(
                stmt, (enumDecl, notExported, hoistedIdent) => {
                  return ts.factory.updateEnumDeclaration(
                      enumDecl, enumDecl.decorators, notExported, hoistedIdent,
                      enumDecl.members);
                });
          } else if (ts.isInterfaceDeclaration(stmt)) {
            transformInnerDeclaration(
                stmt, (interfDecl, notExported, hoistedIdent) => {
                  return ts.factory.updateInterfaceDeclaration(
                      interfDecl, interfDecl.decorators, notExported,
                      hoistedIdent, interfDecl.typeParameters,
                      interfDecl.heritageClauses, interfDecl.members);
                });
          } else {
            error(
                stmt,
                `unsupported statement in declaration merging namespace '${
                    nsName}' (go/ts-merged-namespaces)`);
          }
        }
        if (haveSeenError) {
          // Drop the transformation.
          return [ns];
        }
        // The namespace is now essentially empty. All the declarations have
        // been hoisted out of it. Wrap it in a NotEmittedStatement to
        // prevent the compiler from emitting an iife.
        markAsMergedDeclaration(ns);
        markAsMergedDeclaration(mergedDecl);
        haveTransformedNs = true;
        transformedNsStmts.push(ts.factory.createNotEmittedStatement(ns));
        return transformedNsStmts;

        // Local functions follow.

        type DeclarationStatement = ts.Declaration&ts.DeclarationStatement;

        function transformInnerDeclaration<T extends DeclarationStatement>(
            decl: T,
            factory: (
                decl: T, modifiers: ts.Modifier[]|undefined,
                newIdent: ts.Identifier) => T) {
          if (!decl.name || !ts.isIdentifier(decl.name)) {
            error(
                decl,
                'Anonymous declaration cannot be merged. (go/ts-merged-namespaces)');
            return;
          }
          checkReferences(decl);
          // Check that the inner declaration is exported.
          const originalName = getIdentifierText(decl.name);
          if (!hasModifierFlag(decl, ts.ModifierFlags.Export)) {
            error(
                decl,
                `'${originalName}' must be exported. (go/ts-merged-namespaces)`);
          }

          const hoistedName = `${nsName}$${originalName}`;
          const hoistedIdent = ts.factory.createIdentifier(hoistedName);
          ts.setOriginalNode(hoistedIdent, decl.name);

          // The hoisted declaration is not directly exported.
          const notExported = ts.factory.createModifiersFromModifierFlags(
              ts.getCombinedModifierFlags(decl) & (~ts.ModifierFlags.Export));
          const hoistedDecl = factory(decl, notExported, hoistedIdent);
          ts.setOriginalNode(hoistedDecl, decl);
          ts.setTextRange(hoistedDecl, decl);
          transformedNsStmts.push(hoistedDecl);
          // Add alias `/** @const */ nsName.originalName = hoistedName;`
          transformedNsStmts.push(
              createInnerNameAlias(originalName, hoistedIdent, decl));
        }

        function createInnerNameAlias(
            propName: string, initializer: ts.Identifier,
            original: ts.Node): ts.Statement {
          const prop =
              ts.factory.createExpressionStatement(ts.factory.createAssignment(
                  ts.factory.createPropertyAccessExpression(
                      mergedDecl.name!, propName),
                  initializer));
          ts.setTextRange(prop, original);
          ts.setOriginalNode(prop, original);
          return ts.addSyntheticLeadingComment(
              prop, ts.SyntaxKind.MultiLineCommentTrivia, '* @const ',
              /* hasTrailingNewLine */ true);
        }

        function checkNamespaceRef(ref: ts.EntityName) {
          if (ts.isQualifiedName(ref)) {
            checkNamespaceRef(ref.left);
            return;
          }
          // ref is an unqualified name. If it refers to a symbol that is
          // defined in the namespace, it is missing a qualifier.
          const sym = typeChecker.getSymbolAtLocation(ref);
          // Property 'parent' is marked @internal, need to cast to access.
          const parent = sym && (sym as {parent?: ts.Symbol}).parent;
          if (parent && (parent.flags & ts.SymbolFlags.Module) !== 0) {
            const parentName = parent.getName();
            if (parentName === nsName) {
              // This identifier should be qualified with the parentName.
              const name = getIdentifierText(ref);
              error(
                  ref,
                  `Name '${name}' must be qualified as '${parentName}.${
                      name}'. (go/ts-merged-namespaces)`);
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
                 ts.isEnumDeclaration(node.parent) ||
                 ts.isInterfaceDeclaration(node.parent))) {
              // Do not check the name of the local declaration.
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

        const mergedDecl = getPreviousDeclaration(sym, ns);
        // For a merged namespace, the symbol must already have been declared
        // prior to the namespace declaration, or the compiler reports TS2434.
        if (!mergedDecl) {
          transformedStmts.push(ns);  // Nothing to do here.
          error(
              ns.name,
              'transformation of plain namespace not supported. (go/ts-merged-namespaces)');
          return;
        }

        if (!ts.isInterfaceDeclaration(mergedDecl) &&
            !ts.isClassDeclaration(mergedDecl)) {
          // The previous declaration is not a class or interface.
          transformedStmts.push(ns);  // Nothing to do here.
          error(
              ns.name,
              'merged declaration must be local class or interface. (go/ts-merged-namespaces)');
          return;
        }

        transformedStmts.push(...transformNamespace(ns, mergedDecl));
      }

      function error(node: ts.Node, message: string) {
        reportDiagnostic(diagnostics, node, message);
        haveSeenError = true;
      }
    };
  };
}
