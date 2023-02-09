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
import {getIdentifierText, getPreviousDeclaration, hasModifierFlag, isAmbient, markAsMergedDeclaration, reportDiagnostic} from './transformer_util';

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
      if (haveSeenError || !haveTransformedNs) {
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
          if (ts.isModuleDeclaration(ns)) {
            error(
                ns.name,
                'nested namespaces are not supported.  (go/ts-merged-namespaces)');
          }
          return [ns];
        }
        const nsName = getIdentifierText(ns.name as ts.Identifier);
        const transformedNsStmts: ts.Statement[] = [];
        for (const stmt of ns.body.statements) {
          if (ts.isEmptyStatement(stmt)) continue;
          if (ts.isClassDeclaration(stmt)) {
            transformInnerDeclaration(
                stmt, (classDecl, notExported, hoistedIdent) => {
                  return ts.factory.updateClassDeclaration(
                      classDecl, notExported, hoistedIdent,
                      classDecl.typeParameters, classDecl.heritageClauses,
                      classDecl.members);
                });
          } else if (ts.isEnumDeclaration(stmt)) {
            transformInnerDeclaration(
                stmt, (enumDecl, notExported, hoistedIdent) => {
                  return ts.factory.updateEnumDeclaration(
                      enumDecl, notExported, hoistedIdent, enumDecl.members);
                });
          } else if (ts.isInterfaceDeclaration(stmt)) {
            transformInnerDeclaration(
                stmt, (interfDecl, notExported, hoistedIdent) => {
                  return ts.factory.updateInterfaceDeclaration(
                      interfDecl, notExported, hoistedIdent,
                      interfDecl.typeParameters, interfDecl.heritageClauses,
                      interfDecl.members);
                });
          } else if (ts.isTypeAliasDeclaration(stmt)) {
            transformTypeAliasDeclaration(stmt);
          } else if (ts.isVariableStatement(stmt)) {
            if ((ts.getCombinedNodeFlags(stmt.declarationList) &
                 ts.NodeFlags.Const) === 0) {
              error(
                  stmt,
                  'non-const values are not supported. (go/ts-merged-namespaces)');
            }
            if (!ts.isInterfaceDeclaration(mergedDecl)) {
              error(
                  stmt,
                  'const declaration only allowed when merging with an interface (go/ts-merged-namespaces)');
            }
            transformConstDeclaration(stmt);
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

        function transformConstDeclaration(varDecl: ts.VariableStatement) {
          for (let decl of varDecl.declarationList.declarations) {
            if (!decl.name || !ts.isIdentifier(decl.name)) {
              error(
                  decl,
                  'Destructuring declarations are not supported. (go/ts-merged-namespaces)');
              return;
            }
            const originalName = getIdentifierText(decl.name);
            if (!hasModifierFlag(decl, ts.ModifierFlags.Export)) {
              error(
                  decl,
                  `'${originalName}' must be exported. (go/ts-merged-namespaces)`);
              return;
            }
            decl = fixReferences(decl);
            if (!decl.initializer) {
              error(decl, `'${originalName}' must have an initializer`);
              return;
            }
            transformedNsStmts.push(
                createInnerNameAlias(originalName, decl.initializer, varDecl));
          }
        }

        function transformTypeAliasDeclaration(
            aliasDecl: ts.TypeAliasDeclaration) {
          // Check that the inner declaration is exported.
          const originalName = getIdentifierText(aliasDecl.name);
          if (!hasModifierFlag(aliasDecl, ts.ModifierFlags.Export)) {
            error(
                aliasDecl,
                `'${originalName}' must be exported. (go/ts-merged-namespaces)`);
          }
          aliasDecl = fixReferences(aliasDecl);
          const notExported = ts.factory.createModifiersFromModifierFlags(
              ts.getCombinedModifierFlags(aliasDecl) &
              (~ts.ModifierFlags.Export));
          aliasDecl = ts.factory.updateTypeAliasDeclaration(
              aliasDecl, notExported, aliasDecl.name, aliasDecl.typeParameters,
              aliasDecl.type);
          // visitTypeAliasDeclaration() in jsdocTransformer() recognizes
          // that the type alias is declared in a transformed namespace and
          // generates the type alias as a property of the namespace. No
          // need to generate a name alias here.
          transformedNsStmts.push(aliasDecl);
        }

        function transformInnerDeclaration<T extends DeclarationStatement>(
            decl: T,
            updateDecl: (
                decl: T, modifiers: ts.Modifier[]|undefined,
                newIdent: ts.Identifier) => T) {
          if (!decl.name || !ts.isIdentifier(decl.name)) {
            error(
                decl,
                'Anonymous declaration cannot be merged. (go/ts-merged-namespaces)');
            return;
          }
          // Check that the inner declaration is exported.
          const originalName = getIdentifierText(decl.name);
          if (!hasModifierFlag(decl, ts.ModifierFlags.Export)) {
            error(
                decl,
                `'${originalName}' must be exported. (go/ts-merged-namespaces)`);
          }
          decl = fixReferences(decl);

          const hoistedName = `${nsName}$${originalName}`;
          const hoistedIdent = ts.factory.createIdentifier(hoistedName);
          ts.setOriginalNode(hoistedIdent, decl.name);

          // The hoisted declaration is not directly exported.
          const notExported = ts.factory.createModifiersFromModifierFlags(
              ts.getCombinedModifierFlags(decl) & (~ts.ModifierFlags.Export));
          const hoistedDecl = updateDecl(decl, notExported, hoistedIdent);
          transformedNsStmts.push(hoistedDecl);
          // Add alias `/** @const */ nsName.originalName = hoistedName;`
          const aliasProp =
              createInnerNameAlias(originalName, hoistedIdent, decl);
          // Don't repeat any comments from the original declaration. They
          // are already on the hoisted declaration.
          ts.setEmitFlags(aliasProp, ts.EmitFlags.NoLeadingComments);
          transformedNsStmts.push(aliasProp);
        }

        function createInnerNameAlias(
            propName: string, initializer: ts.Expression,
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

        function isNamespaceRef(ident: ts.Identifier): boolean {
          const sym = typeChecker.getSymbolAtLocation(ident);
          // Property 'parent' is marked @internal, need to cast to access.
          const parent = sym && (sym as {parent?: ts.Symbol}).parent;
          if (parent && (parent.flags & ts.SymbolFlags.Module) !== 0) {
            const parentName = parent.getName();
            if (parentName === nsName) {
              return true;
            }
          }
          return false;
        }

        // Build a property access expression if the identifier refers to a
        // symbol defined in the transformed namespace.
        function maybeFixIdentifier(ident: ts.Identifier): ts.Identifier|
            ts.PropertyAccessExpression {
          if (isNamespaceRef(ident)) {
            const nsIdentifier = ts.factory.createIdentifier(nsName);
            const nsProp =
                ts.factory.createPropertyAccessExpression(nsIdentifier, ident);
            ts.setOriginalNode(nsProp, ident);
            ts.setTextRange(nsProp, ident);
            return nsProp;
          }
          return ident;
        }

        // Update the property access expression if the leftmost identifier
        // refers to a symbol defined in the transformed namespace.
        function maybeFixPropertyAccess(prop: ts.PropertyAccessExpression):
            ts.PropertyAccessExpression {
          if (ts.isPropertyAccessExpression(prop.expression)) {
            const updatedProp = maybeFixPropertyAccess(prop.expression);
            if (updatedProp !== prop.expression) {
              return ts.factory.updatePropertyAccessExpression(
                  prop, updatedProp, prop.name);
            }
            return prop;
          }
          if (!ts.isIdentifier(prop.expression)) {
            return prop;
          }
          // prop.expression is a ts.Identifier.
          const nsProp = maybeFixIdentifier(prop.expression);
          if (nsProp !== prop.expression) {
            const newPropAccess = ts.factory.updatePropertyAccessExpression(
                prop, nsProp, prop.name);
            return newPropAccess;
          }
          return prop;
        }

        // Fix all unqualified references to a symbol defined in the
        // transformed namespace by adding a qualification.
        function fixReferences<T extends ts.Node>(node: T): T {
          // TODO: Are there other node types that need to be handled?
          const rootNode = node;
          function refCheckVisitor(node: ts.Node): ts.Node|undefined {
            if (ts.isTypeReferenceNode(node) || ts.isTypeQueryNode(node)) {
              // Type reference nodes are used for explicit type annotations of
              // properties, parameters, function results etc. References to
              // types defined in the transformed namespace do not need to be
              // fixed (qualified) because type checking has already happened in
              // the compiler before the transformation. The type translator
              // will produce the correct qualified name based on the symbol
              // type, not the type reference.
              // The same is also true for TypeQueryNode, which appears in
              // type expressions like 'typeof X'
              return node;
            }
            if (ts.isPropertyAccessExpression(node)) {
              return maybeFixPropertyAccess(node);
            }
            if (!ts.isIdentifier(node)) {
              return ts.visitEachChild(node, refCheckVisitor, context);
            }
            // node is a ts.Identifier.
            if (node.parent === rootNode) {
              // Do not check or modify the name of the declaration that is
              // being tranformed.
              return node;
            }
            // Any remaining identifiers that need qualification are
            // modified into PropertyAccessExpressions.
            return maybeFixIdentifier(node);
          }
          return ts.visitEachChild(node, refCheckVisitor, context);
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
