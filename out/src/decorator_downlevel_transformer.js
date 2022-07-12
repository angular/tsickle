"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.decoratorDownlevelTransformer = exports.shouldLower = void 0;
/**
 * @fileoverview Decorator downleveling support. tsickle can optionally convert decorator calls
 * into annotations. For example, a decorator application on a method:
 *   class X {
 *     @Foo(1, 2)
 *     bar() { ... }
 *   }
 * Will get converted to:
 *   class X {
 *     bar() { ... }
 *     static propDecorators = {
 *       bar: {type: Foo, args: [1, 2]}
 *     }
 *   }
 * Similarly for decorators on the class (property 'decorators') and decorators on the constructor
 * (property 'ctorParameters', including the types of all arguments of the constructor).
 *
 * This is used by, among other software, Angular in its "non-AoT" mode to inspect decorator
 * invocations.
 */
const ts = require("typescript");
const decorators_1 = require("./decorators");
const jsdoc = require("./jsdoc");
const transformer_util_1 = require("./transformer_util");
/**
 * Returns true if the given decorator should be downleveled.
 *
 * Decorators that have JSDoc on them including the `@Annotation` tag are downleveled and converted
 * into properties on the class by this pass.
 */
function shouldLower(decorator, typeChecker) {
    for (const d of (0, decorators_1.getDecoratorDeclarations)(decorator, typeChecker)) {
        // TODO(lucassloan):
        // Switch to the TS JSDoc parser in the future to avoid false positives here.
        // For example using '@Annotation' in a true comment.
        // However, a new TS API would be needed, track at
        // https://github.com/Microsoft/TypeScript/issues/7393.
        let commentNode = d;
        // Not handling PropertyAccess expressions here, because they are
        // filtered earlier.
        if (commentNode.kind === ts.SyntaxKind.VariableDeclaration) {
            if (!commentNode.parent)
                continue;
            commentNode = commentNode.parent;
        }
        // Go up one more level to VariableDeclarationStatement, where usually
        // the comment lives. If the declaration has an 'export', the
        // VDList.getFullText will not contain the comment.
        if (commentNode.kind === ts.SyntaxKind.VariableDeclarationList) {
            if (!commentNode.parent)
                continue;
            commentNode = commentNode.parent;
        }
        const range = (0, transformer_util_1.getAllLeadingComments)(commentNode);
        if (!range)
            continue;
        for (const { text } of range) {
            if (text.includes('@Annotation'))
                return true;
        }
    }
    return false;
}
exports.shouldLower = shouldLower;
const DECORATOR_INVOCATION_JSDOC_TYPE = '!Array<{type: !Function, args: (undefined|!Array<?>)}>';
function addJSDocTypeAnnotation(node, jsdocType) {
    ts.setSyntheticLeadingComments(node, [
        jsdoc.toSynthesizedComment([{
                tagName: 'type',
                type: jsdocType,
            }]),
    ]);
}
/**
 * Extracts the type of the decorator (the function or expression invoked), as well as all the
 * arguments passed to the decorator. Returns an AST with the form:
 *
 *     // For @decorator(arg1, arg2)
 *     { type: decorator, args: [arg1, arg2] }
 */
function extractMetadataFromSingleDecorator(decorator, diagnostics) {
    const metadataProperties = [];
    const expr = decorator.expression;
    switch (expr.kind) {
        case ts.SyntaxKind.Identifier:
            // The decorator was a plain @Foo.
            metadataProperties.push(ts.factory.createPropertyAssignment('type', expr));
            break;
        case ts.SyntaxKind.CallExpression:
            // The decorator was a call, like @Foo(bar).
            const call = expr;
            metadataProperties.push(ts.factory.createPropertyAssignment('type', call.expression));
            if (call.arguments.length) {
                const args = [];
                for (const arg of call.arguments) {
                    args.push(arg);
                }
                const argsArrayLiteral = ts.factory.createArrayLiteralExpression(ts.factory.createNodeArray(args, /* hasTrailingComma */ true));
                metadataProperties.push(ts.factory.createPropertyAssignment('args', argsArrayLiteral));
            }
            break;
        default:
            diagnostics.push({
                file: decorator.getSourceFile(),
                start: decorator.getStart(),
                length: decorator.getEnd() - decorator.getStart(),
                messageText: `${ts.SyntaxKind[decorator.kind]} not implemented in gathering decorator metadata`,
                category: ts.DiagnosticCategory.Error,
                code: 0,
            });
            break;
    }
    return ts.factory.createObjectLiteralExpression(metadataProperties);
}
/**
 * Takes a list of decorator metadata object ASTs and produces an AST for a
 * static class property of an array of those metadata objects.
 */
function createDecoratorClassProperty(decoratorList) {
    const modifier = ts.factory.createToken(ts.SyntaxKind.StaticKeyword);
    const initializer = ts.factory.createArrayLiteralExpression(ts.factory.createNodeArray(decoratorList, /* hasTrailingComma */ true), true);
    const prop = ts.factory.createPropertyDeclaration(undefined, [modifier], 'decorators', undefined, undefined, initializer);
    addJSDocTypeAnnotation(prop, DECORATOR_INVOCATION_JSDOC_TYPE);
    // NB: the .decorators property does not get a @nocollapse property. There is
    // no good reason why - it means .decorators is not runtime accessible if you
    // compile with collapse properties, whereas propDecorators is, which doesn't
    // follow any stringent logic. However this has been the case previously, and
    // adding it back in leads to substantial code size increases as Closure fails
    // to tree shake these props without @nocollapse.
    return prop;
}
/**
 * createCtorParametersClassProperty creates a static 'ctorParameters' property containing
 * downleveled decorator information.
 *
 * The property contains an arrow function that returns an array of object literals of the shape:
 *     static ctorParameters = () => [{
 *       type: SomeClass|undefined,  // the type of the param that's decorated, if it's a value.
 *       decorators: [{
 *         type: DecoratorFn,  // the type of the decorator that's invoked.
 *         args: [ARGS],       // the arguments passed to the decorator.
 *       }]
 *     }];
 */
function createCtorParametersClassProperty(diagnostics, entityNameToExpression, ctorParameters) {
    const params = [];
    for (const ctorParam of ctorParameters) {
        if (!ctorParam.type && ctorParam.decorators.length === 0) {
            params.push(ts.factory.createNull());
            continue;
        }
        const paramType = ctorParam.type ?
            typeReferenceToExpression(entityNameToExpression, ctorParam.type) :
            undefined;
        const members = [ts.factory.createPropertyAssignment('type', paramType || ts.factory.createIdentifier('undefined'))];
        const decorators = [];
        for (const deco of ctorParam.decorators) {
            decorators.push(extractMetadataFromSingleDecorator(deco, diagnostics));
        }
        if (decorators.length) {
            members.push(ts.factory.createPropertyAssignment('decorators', ts.factory.createArrayLiteralExpression(decorators)));
        }
        params.push(ts.factory.createObjectLiteralExpression(members));
    }
    const initializer = ts.factory.createArrowFunction(undefined, undefined, [], undefined, ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), ts.factory.createArrayLiteralExpression(params, true));
    const ctorProp = ts.factory.createPropertyDeclaration(undefined, [ts.factory.createToken(ts.SyntaxKind.StaticKeyword)], 'ctorParameters', undefined, undefined, initializer);
    ts.setSyntheticLeadingComments(ctorProp, [
        jsdoc.toSynthesizedComment([
            {
                tagName: 'type',
                type: lines(`function(): !Array<(null|{`, `  type: ?,`, `  decorators: (undefined|${DECORATOR_INVOCATION_JSDOC_TYPE}),`, `})>`),
            },
            { tagName: 'nocollapse' }
        ]),
    ]);
    return ctorProp;
}
/**
 * createPropDecoratorsClassProperty creates a static 'propDecorators' property containing type
 * information for every property that has a decorator applied.
 *
 *     static propDecorators: {[key: string]: {type: Function, args?: any[]}[]} = {
 *       propA: [{type: MyDecorator, args: [1, 2]}, ...],
 *       ...
 *     };
 */
function createPropDecoratorsClassProperty(diagnostics, properties) {
    //  `static propDecorators: {[key: string]: ` + {type: Function, args?: any[]}[] + `} = {\n`);
    const entries = [];
    for (const [name, decorators] of properties.entries()) {
        entries.push(ts.factory.createPropertyAssignment(name, ts.factory.createArrayLiteralExpression(decorators.map(deco => extractMetadataFromSingleDecorator(deco, diagnostics)))));
    }
    const initializer = ts.factory.createObjectLiteralExpression(entries, true);
    const prop = ts.factory.createPropertyDeclaration(undefined, [ts.factory.createToken(ts.SyntaxKind.StaticKeyword)], 'propDecorators', undefined, undefined, initializer);
    addJSDocTypeAnnotation(prop, `!Object<string, ${DECORATOR_INVOCATION_JSDOC_TYPE}>`);
    return prop;
}
/**
 * Returns an expression representing the (potentially) value part for the given node.
 *
 * This is a partial re-implementation of TypeScript's serializeTypeReferenceNode. This is a
 * workaround for https://github.com/Microsoft/TypeScript/issues/17516 (serializeTypeReferenceNode
 * not being exposed). In practice this implementation is sufficient for Angular's use of type
 * metadata.
 */
function typeReferenceToExpression(entityNameToExpression, node) {
    let kind = node.kind;
    if (ts.isLiteralTypeNode(node)) {
        // Treat literal types like their base type (boolean, string, number).
        kind = node.literal.kind;
    }
    switch (kind) {
        case ts.SyntaxKind.FunctionType:
        case ts.SyntaxKind.ConstructorType:
            return ts.factory.createIdentifier('Function');
        case ts.SyntaxKind.ArrayType:
        case ts.SyntaxKind.TupleType:
            return ts.factory.createIdentifier('Array');
        case ts.SyntaxKind.TypePredicate:
        case ts.SyntaxKind.TrueKeyword:
        case ts.SyntaxKind.FalseKeyword:
        case ts.SyntaxKind.BooleanKeyword:
            return ts.factory.createIdentifier('Boolean');
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.StringKeyword:
            return ts.factory.createIdentifier('String');
        case ts.SyntaxKind.ObjectKeyword:
            return ts.factory.createIdentifier('Object');
        case ts.SyntaxKind.NumberKeyword:
        case ts.SyntaxKind.NumericLiteral:
            return ts.factory.createIdentifier('Number');
        case ts.SyntaxKind.TypeReference:
            const typeRef = node;
            // Ignore any generic types, just return the base type.
            return entityNameToExpression(typeRef.typeName);
        default:
            return undefined;
    }
}
/**
 * Transformer factory for the decorator downlevel transformer. See fileoverview for details.
 */
function decoratorDownlevelTransformer(typeChecker, diagnostics) {
    return (context) => {
        /** A map from symbols to the identifier of an import, reset per SourceFile. */
        let importNamesBySymbol = new Map();
        /**
         * Converts an EntityName (from a type annotation) to an expression (accessing a value).
         *
         * For a given ts.EntityName, this walks depth first to find the leftmost ts.Identifier, then
         * converts the path into property accesses.
         *
         * This generally works, but TypeScript's emit pipeline does not serialize identifiers that are
         * only used in a type location (such as identifiers in a TypeNode), even if the identifier
         * itself points to a value (e.g. a class). To avoid that problem, this method finds the symbol
         * representing the identifier (using typeChecker), then looks up where it was imported (using
         * importNamesBySymbol), and then uses the imported name instead of the identifier from the type
         * expression, if any. Otherwise it'll use the identifier unchanged. This makes sure the
         * identifier is not marked as stemming from a "type only" expression, causing it to be emitted
         * and causing the import to be retained.
         */
        function entityNameToExpression(name) {
            const sym = typeChecker.getSymbolAtLocation(name);
            if (!sym)
                return undefined;
            // Check if the entity name references a symbol that is an actual value. If it is not, it
            // cannot be referenced by an expression, so return undefined.
            if (!(0, transformer_util_1.symbolIsValue)(typeChecker, sym))
                return undefined;
            if (ts.isIdentifier(name)) {
                // If there's a known import name for this symbol, use it so that the import will be
                // retained and the value can be referenced.
                if (importNamesBySymbol.has(sym))
                    return importNamesBySymbol.get(sym);
                // Otherwise this will be a locally declared name, just return that.
                return name;
            }
            const ref = entityNameToExpression(name.left);
            if (!ref)
                return undefined;
            return ts.factory.createPropertyAccessExpression(ref, name.right);
        }
        /**
         * Transforms a class element. Returns a three tuple of name, transformed element, and
         * decorators found. Returns an undefined name if there are no decorators to lower on the
         * element, or the element has an exotic name.
         */
        function transformClassElement(element) {
            var _a;
            element = ts.visitEachChild(element, visitor, context);
            const decoratorsToKeep = [];
            const toLower = [];
            for (const decorator of element.decorators || []) {
                if (!shouldLower(decorator, typeChecker)) {
                    decoratorsToKeep.push(decorator);
                    continue;
                }
                toLower.push(decorator);
            }
            if (!toLower.length)
                return [undefined, element, []];
            if (!element.name || element.name.kind !== ts.SyntaxKind.Identifier) {
                // Method has a weird name, e.g.
                //   [Symbol.foo]() {...}
                diagnostics.push({
                    file: element.getSourceFile(),
                    start: element.getStart(),
                    length: element.getEnd() - element.getStart(),
                    messageText: `cannot process decorators on strangely named method`,
                    category: ts.DiagnosticCategory.Error,
                    code: 0,
                });
                return [undefined, element, []];
            }
            const name = element.name.text;
            let newNode;
            const decorators = decoratorsToKeep.length ?
                ts.setTextRange(ts.factory.createNodeArray(decoratorsToKeep), element.decorators) :
                undefined;
            switch (element.kind) {
                case ts.SyntaxKind.PropertyDeclaration:
                    newNode = ts.factory.updatePropertyDeclaration(element, decorators, element.modifiers, element.name, (_a = element.questionToken) !== null && _a !== void 0 ? _a : element.exclamationToken, element.type, element.initializer);
                    break;
                case ts.SyntaxKind.GetAccessor:
                    newNode = ts.factory.updateGetAccessorDeclaration(element, decorators, element.modifiers, element.name, element.parameters, element.type, element.body);
                    break;
                case ts.SyntaxKind.SetAccessor:
                    newNode = ts.factory.updateSetAccessorDeclaration(element, decorators, element.modifiers, element.name, element.parameters, element.body);
                    break;
                case ts.SyntaxKind.MethodDeclaration:
                    newNode = ts.factory.updateMethodDeclaration(element, decorators, element.modifiers, element.asteriskToken, element.name, element.questionToken, element.typeParameters, element.parameters, element.type, element.body);
                    break;
                default:
                    throw new Error(`unexpected element: ${element}`);
            }
            return [name, newNode, toLower];
        }
        /**
         * Transforms a constructor. Returns the transformed constructor and the list of parameter
         * information collected, consisting of decorators and optional type.
         */
        function transformConstructor(ctor) {
            ctor = ts.visitEachChild(ctor, visitor, context);
            const newParameters = [];
            const oldParameters = ts.visitParameterList(ctor.parameters, visitor, context);
            const parametersInfo = [];
            for (const param of oldParameters) {
                const decoratorsToKeep = [];
                const paramInfo = { decorators: [], type: null };
                for (const decorator of param.decorators || []) {
                    if (!shouldLower(decorator, typeChecker)) {
                        decoratorsToKeep.push(decorator);
                        continue;
                    }
                    paramInfo.decorators.push(decorator);
                }
                if (param.type) {
                    // param has a type provided, e.g. "foo: Bar".
                    // The type will be emitted as a value expression in entityNameToExpression, which takes
                    // care not to emit anything for types that cannot be expressed as a value (e.g.
                    // interfaces).
                    paramInfo.type = param.type;
                }
                parametersInfo.push(paramInfo);
                const newParam = ts.factory.updateParameterDeclaration(param, 
                // Must pass 'undefined' to avoid emitting decorator metadata.
                decoratorsToKeep.length ? decoratorsToKeep : undefined, param.modifiers, param.dotDotDotToken, param.name, param.questionToken, param.type, param.initializer);
                newParameters.push(newParam);
            }
            const updated = ts.factory.updateConstructorDeclaration(ctor, ctor.decorators, ctor.modifiers, newParameters, ts.visitFunctionBody(ctor.body, visitor, context));
            return [updated, parametersInfo];
        }
        /**
         * Transforms a single class declaration:
         * - dispatches to strip decorators on members
         * - converts decorators on the class to annotations
         * - creates a ctorParameters property
         * - creates a propDecorators property
         */
        function transformClassDeclaration(classDecl) {
            const newMembers = [];
            const decoratedProperties = new Map();
            let classParameters = null;
            for (const member of classDecl.members) {
                switch (member.kind) {
                    case ts.SyntaxKind.PropertyDeclaration:
                    case ts.SyntaxKind.GetAccessor:
                    case ts.SyntaxKind.SetAccessor:
                    case ts.SyntaxKind.MethodDeclaration: {
                        const [name, newMember, decorators] = transformClassElement(member);
                        newMembers.push(newMember);
                        if (name)
                            decoratedProperties.set(name, decorators);
                        continue;
                    }
                    case ts.SyntaxKind.Constructor: {
                        const ctor = member;
                        if (!ctor.body)
                            break;
                        const [newMember, parametersInfo] = transformConstructor(member);
                        classParameters = parametersInfo;
                        newMembers.push(newMember);
                        continue;
                    }
                    default:
                        break;
                }
                newMembers.push(ts.visitEachChild(member, visitor, context));
            }
            const decorators = classDecl.decorators || [];
            const decoratorsToLower = [];
            const decoratorsToKeep = [];
            for (const decorator of decorators) {
                if (shouldLower(decorator, typeChecker)) {
                    decoratorsToLower.push(extractMetadataFromSingleDecorator(decorator, diagnostics));
                }
                else {
                    decoratorsToKeep.push(decorator);
                }
            }
            if (decoratorsToLower.length) {
                newMembers.push(createDecoratorClassProperty(decoratorsToLower));
            }
            if (classParameters) {
                if ((decoratorsToLower.length) || classParameters.some(p => !!p.decorators.length)) {
                    // emit ctorParameters if the class was decoratored at all, or if any of its ctors
                    // were classParameters
                    newMembers.push(createCtorParametersClassProperty(diagnostics, entityNameToExpression, classParameters));
                }
            }
            if (decoratedProperties.size) {
                newMembers.push(createPropDecoratorsClassProperty(diagnostics, decoratedProperties));
            }
            const newDecorators = decoratorsToKeep.length ?
                ts.factory.createNodeArray(decoratorsToKeep) :
                undefined;
            return ts.factory.updateClassDeclaration(classDecl, newDecorators, classDecl.modifiers, classDecl.name, classDecl.typeParameters, classDecl.heritageClauses, ts.setTextRange(ts.factory.createNodeArray(newMembers, classDecl.members.hasTrailingComma), classDecl.members));
        }
        function visitor(node) {
            switch (node.kind) {
                case ts.SyntaxKind.SourceFile: {
                    importNamesBySymbol = new Map();
                    return ts.visitEachChild(node, visitor, context);
                }
                case ts.SyntaxKind.ImportDeclaration: {
                    const impDecl = node;
                    if (impDecl.importClause) {
                        const importClause = impDecl.importClause;
                        const names = [];
                        if (importClause.name) {
                            names.push(importClause.name);
                        }
                        if (importClause.namedBindings &&
                            importClause.namedBindings.kind === ts.SyntaxKind.NamedImports) {
                            const namedImports = importClause.namedBindings;
                            names.push(...namedImports.elements.map(e => e.name));
                        }
                        for (const name of names) {
                            const sym = typeChecker.getSymbolAtLocation(name);
                            importNamesBySymbol.set(sym, name);
                        }
                    }
                    return ts.visitEachChild(node, visitor, context);
                }
                case ts.SyntaxKind.ClassDeclaration: {
                    return transformClassDeclaration(node);
                }
                default:
                    return (0, transformer_util_1.visitEachChild)(node, visitor, context);
            }
        }
        return (sf) => visitor(sf);
    };
}
exports.decoratorDownlevelTransformer = decoratorDownlevelTransformer;
function lines(...s) {
    return s.join('\n');
}
//# sourceMappingURL=decorator_downlevel_transformer.js.map