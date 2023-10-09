/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview Transforms TypeScript enum declarations to Closure enum declarations, which
 * look like:
 *
 *     /.. @enum {number} ./
 *     const Foo = {BAR: 0, BAZ: 1, ...};
 *     export {Foo};  // even if originally exported on one line.
 *
 * This declares an enum type for Closure Compiler (and Closure JS users of this TS code).
 * Splitting the enum into declaration and export is required so that local references to the
 * type resolve ("@type {Foo}").
 */

import * as ts from 'typescript';

import * as jsdoc from './jsdoc';
import {createSingleQuoteStringLiteral, getIdentifierText, hasModifierFlag, isAmbient, isMergedDeclaration} from './transformer_util';

/**
 * isInUnsupportedNamespace returns true if any of node's ancestors is a
 * namespace (ModuleDeclaration) that is not a transformed declaration merging
 * namespace.
 */
function isInUnsupportedNamespace(node: ts.Node) {
  // Must use the original node because node might have already been transformed, with node.parent
  // no longer being set.
  let parent = ts.getOriginalNode(node).parent;
  while (parent) {
    if (parent.kind === ts.SyntaxKind.ModuleDeclaration) {
      return !isMergedDeclaration(parent as ts.ModuleDeclaration);
    }
    parent = parent.parent;
  }
  return false;
}

/**
 * getEnumMemberType computes the type of an enum member by inspecting its initializer expression.
 */
function getEnumMemberType(typeChecker: ts.TypeChecker, member: ts.EnumMember): 'number'|'string' {
  // Enum members without initialization have type 'number'
  if (!member.initializer) {
    return 'number';
  }
  const type = typeChecker.getTypeAtLocation(member.initializer);
  // Note: checking against 'NumberLike' instead of just 'Number' means this code
  // handles both
  //   MEMBER = 3,  // TypeFlags.NumberLiteral
  // and
  //   MEMBER = someFunction(),  // TypeFlags.Number
  if (type.flags & ts.TypeFlags.NumberLike) {
    return 'number';
  }
  // If the value is not a number, it must be a string.
  // TypeScript does not allow enum members to have any other type.
  return 'string';
}

/**
 * getEnumType computes the Closure type of an enum, by iterating through the members and gathering
 * their types.
 */
export function getEnumType(typeChecker: ts.TypeChecker, enumDecl: ts.EnumDeclaration): 'number'|
    'string'|'?' {
  let hasNumber = false;
  let hasString = false;
  for (const member of enumDecl.members) {
    const type = getEnumMemberType(typeChecker, member);
    if (type === 'string') {
      hasString = true;
    } else if (type === 'number') {
      hasNumber = true;
    }
  }
  if (hasNumber && hasString) {
    return '?';  // Closure's new type inference doesn't support enums of unions.
  } else if (hasNumber) {
    return 'number';
  } else if (hasString) {
    return 'string';
  } else {
    // Perhaps an empty enum?
    return '?';
  }
}

/**
 * Transformer factory for the enum transformer. See fileoverview for details.
 */
export function enumTransformer(typeChecker: ts.TypeChecker):
    (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    function visitor<T extends ts.Node>(node: T): T|ts.Node[] {
      if (!ts.isEnumDeclaration(node)) return ts.visitEachChild(node, visitor, context);

      // TODO(martinprobst): The enum transformer does not work for enums embedded in namespaces,
      // because TS does not support splitting export and declaration ("export {Foo};") in
      // namespaces. tsickle's emit for namespaces is unintelligible for Closure in any case, so
      // this is left to fix for another day.
      if (isInUnsupportedNamespace(node)) {
        return ts.visitEachChild(node, visitor, context);
      }

      // TypeScript does not emit any code for ambient enums, so early exit here to prevent the code
      // below from producing runtime values for an ambient structure.
      if (isAmbient(node)) return ts.visitEachChild(node, visitor, context);

      const isExported = hasModifierFlag(node, ts.ModifierFlags.Export);
      const enumType = getEnumType(typeChecker, node);

      const values: ts.PropertyAssignment[] = [];
      let enumIndex = 0;
      for (const member of node.members) {
        let enumValue: ts.Expression;
        if (member.initializer) {
          const enumConstValue = typeChecker.getConstantValue(member);
          if (typeof enumConstValue === 'number') {
            enumIndex = enumConstValue + 1;
            if (enumConstValue < 0) {
              enumValue = ts.factory.createPrefixUnaryExpression(
                  ts.SyntaxKind.MinusToken,
                  ts.factory.createNumericLiteral(-enumConstValue));
            } else {
              enumValue = ts.factory.createNumericLiteral(enumConstValue);
            }
          } else if (typeof enumConstValue === 'string') {
            // tsickle does not care about string enum values. However TypeScript expects compile
            // time constant enum values to be replaced with their constant expression, and e.g.
            // doesn't emit imports for modules referenced in them. Because tsickle replaces the
            // enum with an object literal, i.e. handles the enum transform, it must thus also do
            // the const value substitution for strings.
            enumValue = ts.factory.createStringLiteral(enumConstValue);
          } else {
            // Non-numeric enum value (string or an expression).
            // Emit this initializer expression as-is.
            // Note: if the member's initializer expression refers to another
            // value within the enum (e.g. something like
            //   enum Foo {
            //     Field1,
            //     Field2 = Field1 + something(),
            //   }
            // Then when we emit the initializer we produce invalid code because
            // on the Closure side the reference to Field1 has to be namespaced,
            // e.g. written "Foo.Field1 + something()".
            // Hopefully this doesn't come up often -- if the enum instead has
            // something like
            //     Field2 = Field1 + 3,
            // then it's still a constant expression and we inline the constant
            // value in the above branch of this "if" statement.
            enumValue = visitor(member.initializer) as ts.Expression;
          }
        } else {
          enumValue = ts.factory.createNumericLiteral(enumIndex);
          enumIndex++;
        }
        values.push(ts.setOriginalNode(
            ts.setTextRange(
                ts.factory.createPropertyAssignment(member.name, enumValue),
                member),
            member));
      }

      const varDecl = ts.factory.createVariableDeclaration(
          node.name, /* exclamationToken */ undefined, /* type */ undefined,
          ts.factory.createObjectLiteralExpression(
              ts.setTextRange(
                  ts.factory.createNodeArray(values, true), node.members),
              true));
      const varDeclStmt = ts.setOriginalNode(
          ts.setTextRange(
              ts.factory.createVariableStatement(
                  /* modifiers */ undefined,
                  ts.factory.createVariableDeclarationList(
                      [varDecl],
                      /* create a const var */ ts.NodeFlags.Const)),
              node),
          node);

      const tags = jsdoc.getJSDocTags(ts.getOriginalNode(node));
      tags.push({tagName: 'enum', type: enumType});
      const comment = jsdoc.toSynthesizedComment(tags);
      ts.setSyntheticLeadingComments(varDeclStmt, [comment]);

      const name = getIdentifierText(node.name);
      const resultNodes: ts.Node[] = [varDeclStmt];
      if (isExported) {
        // Create a separate export {...} statement, so that the enum name can be used in local
        // type annotations within the file.
        resultNodes.push(ts.factory.createExportDeclaration(
            /* modifiers */ undefined,
            /* isTypeOnly */ false,
            ts.factory.createNamedExports([ts.factory.createExportSpecifier(
                /* isTypeOnly */ false, undefined, name)])));
      }

      if (hasModifierFlag(node, ts.ModifierFlags.Const)) {
        // By TypeScript semantics, const enums disappear after TS compilation.
        // We still need to generate the runtime value above to make Closure Compiler's type system
        // happy and allow refering to enums from JS code, but we should at least not emit string
        // value mappings.
        return resultNodes;
      }

      // Emit the reverse mapping of foo[foo.BAR] = 'BAR'; lines for number enum members
      for (const member of node.members) {
        const memberName = member.name;
        const memberType = getEnumMemberType(typeChecker, member);
        // Enum members cannot be named with a private identifier, although it
        // is technically valid in the AST.
        if (memberType !== 'number' || ts.isPrivateIdentifier(memberName)) {
          continue;
        }

        // TypeScript enum members can have Identifier names or String names.
        // We need to emit slightly different code to support these two syntaxes:
        let nameExpr: ts.Expression;
        let memberAccess: ts.Expression;
        if (ts.isIdentifier(memberName)) {
          // Foo[Foo.ABC] = "ABC";
          nameExpr = createSingleQuoteStringLiteral(memberName.text);
          // Make sure to create a clean, new identifier, so comments do not get emitted twice.
          const ident =
              ts.factory.createIdentifier(getIdentifierText(memberName));
          memberAccess = ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier(name), ident);
        } else {
          // Foo[Foo["A B C"]] = "A B C"; or Foo[Foo[expression]] = expression;
          nameExpr = ts.isComputedPropertyName(memberName) ? memberName.expression : memberName;
          memberAccess = ts.factory.createElementAccessExpression(
              ts.factory.createIdentifier(name), nameExpr);
        }
        resultNodes.push(
            ts.factory.createExpressionStatement(ts.factory.createAssignment(
                ts.factory.createElementAccessExpression(
                    ts.factory.createIdentifier(name), memberAccess),
                nameExpr)));
      }
      return resultNodes;
    }

    return (sf: ts.SourceFile) => visitor(sf) as ts.SourceFile;
  };
}
