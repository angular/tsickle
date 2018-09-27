/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview Abstraction over the TypeScript API that makes multiple
 * versions of TypeScript appear to be interoperable. Any time a breaking change
 * in TypeScript affects Tsickle code, we should extend this shim to present an
 * unbroken API.
 * All code in tsickle should import from this location, not from 'typescript'.
 */

// tslint:disable:no-any We need to do various unsafe casts between TS versions

import * as ts from 'typescript';

// Note, this import depends on a genrule copying the .d.ts file to this package
import * as ts24 from './typescript-2.4';

export {__String, addSyntheticLeadingComment, addSyntheticTrailingComment, AsExpression, AssertionExpression, BinaryExpression, Block, CallExpression, CancellationToken, ClassDeclaration, ClassElement, ClassLikeDeclaration, CommentRange, CompilerHost, CompilerOptions, ConstructorDeclaration, createArrayLiteral, createArrayTypeNode, createArrowFunction, createAssignment, createBinary, createBlock, createCall, createCompilerHost, createElementAccess, createExportSpecifier, createFunctionDeclaration, createFunctionExpression, createFunctionTypeNode, createIdentifier, createIf, createIndexSignature, createKeywordTypeNode, createLiteral, createLiteralTypeNode, createNamedExports, createNodeArray, createNotEmittedStatement, createNull, createObjectLiteral, createParameter, createParen, createProgram, createProperty, createPropertyAccess, createPropertyAssignment, createPropertySignature, createSourceFile, createStatement, createToken, createTypeLiteralNode, createTypeReferenceNode, createUnionTypeNode, createVariableDeclaration, createVariableDeclarationList, createVariableStatement, CustomTransformers, Declaration, DeclarationStatement, DeclarationWithTypeParameters, Decorator, Diagnostic, DiagnosticCategory, ElementAccessExpression, EmitFlags, EmitResult, EntityName, EnumDeclaration, EnumMember, ExportDeclaration, ExportSpecifier, Expression, ExpressionStatement, flattenDiagnosticMessageText, forEachChild, formatDiagnostics, FormatDiagnosticsHost, FunctionDeclaration, FunctionLikeDeclaration, GetAccessorDeclaration, getCombinedModifierFlags, getCombinedNodeFlags, getLeadingCommentRanges, getLineAndCharacterOfPosition, getMutableClone, getOriginalNode, getPreEmitDiagnostics, getSyntheticLeadingComments, getSyntheticTrailingComments, getTrailingCommentRanges, HeritageClause, Identifier, IfStatement, ImportDeclaration, ImportEqualsDeclaration, ImportSpecifier, IndexKind, InterfaceDeclaration, isArrowFunction, isAssertionExpression, isBinaryExpression, isCallExpression, isExportAssignment, isExportDeclaration, isExpressionStatement, isExternalModule, isExternalModuleReference, isFunctionDeclaration, isIdentifier, isImportDeclaration, isImportEqualsDeclaration, isInterfaceDeclaration, isLiteralExpression, isLiteralTypeNode, isMethodSignature, isModuleBlock, isModuleDeclaration, isNamedImports, isNamespaceExportDeclaration, isNamespaceImport, isNonNullExpression, isObjectLiteralExpression, isParenthesizedExpression, isPropertyAccessExpression, isPropertyAssignment, isPropertyDeclaration, isPropertySignature, isQualifiedName, isSourceFile, isStringLiteral, isTypeReferenceNode, isVariableDeclaration, isVariableStatement, MethodDeclaration, Modifier, ModifierFlags, ModuleBlock, ModuleDeclaration, ModuleKind, ModuleResolutionHost, NamedDeclaration, NamedImports, NamespaceExportDeclaration, Node, NodeArray, NodeFlags, NonNullExpression, NotEmittedStatement, ObjectFlags, ObjectLiteralElementLike, ObjectLiteralExpression, ObjectType, ParameterDeclaration, parseCommandLine, parseJsonConfigFileContent, Program, PropertyAccessExpression, PropertyAssignment, PropertyDeclaration, PropertyName, PropertySignature, QualifiedName, readConfigFile, resolveModuleName, ScriptTarget, SetAccessorDeclaration, setCommentRange, setEmitFlags, setOriginalNode, setSourceMapRange, setSyntheticLeadingComments, setSyntheticTrailingComments, setTextRange, Signature, SignatureDeclaration, SignatureKind, SourceFile, Statement, StringLiteral, Symbol, SymbolFlags, SymbolFormatFlags, SymbolWriter, SyntaxKind, SynthesizedComment, sys, TextRange, ThisExpression, Token, TransformationContext, Transformer, TransformerFactory, Type, TypeAliasDeclaration, TypeAssertion, TypeChecker, TypeElement, TypeFlags, TypeNode, TypeParameterDeclaration, TypeReference, TypeReferenceNode, UnionType, updateAsExpression, updateBlock, updateConstructor, updateExportDeclaration, updateExpressionWithTypeArguments, updateGetAccessor, updateHeritageClause, updateMethod, updateNamedExports, updateNonNullExpression, updateParameter, updatePropertyAccess, updateSetAccessor, updateSourceFileNode, updateTypeAssertion, VariableDeclaration, VariableStatement, visitEachChild, visitFunctionBody, visitLexicalEnvironment, visitNode, Visitor, visitParameterList, WriteFileCallback} from 'typescript';

// tslint:disable-next-line:variable-name Re-exporting JSDocSignature for backwards compat.
export const SyntaxKindJSDocSignature = ts.SyntaxKind.JSDocSignature;

// getEmitFlags is now private starting in TS 2.5.
// So we define our own method that calls through to TypeScript to defeat the
// visibility constraint.
export function getEmitFlags(node: ts.Node): ts.EmitFlags|undefined {
  return (ts as any).getEmitFlags(node);
}

// Between TypeScript 2.4 and 2.5 updateProperty was modified. If called with 2.4 re-order the
// parameters.
export let updateProperty = ts.updateProperty;

const [major, minor] = ts.version.split('.');
if (major === '2' && minor === '4') {
  const updateProperty24 = ts.updateProperty as any as typeof ts24.updateProperty;
  updateProperty = (node: ts.PropertyDeclaration, decorators: ReadonlyArray<ts.Decorator>|undefined,
                    modifiers: ReadonlyArray<ts.Modifier>|undefined, name: string|ts.PropertyName,
                    questionToken: ts.QuestionToken|undefined, type: ts.TypeNode|undefined,
                    initializer: ts.Expression|undefined): ts.PropertyDeclaration => {
    return updateProperty24(
               node as any as ts24.PropertyDeclaration, decorators as any as ts24.Decorator[],
               modifiers as any, name as any, type as any, initializer as any) as any;
  };
}
