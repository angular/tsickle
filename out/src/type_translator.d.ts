/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import { AnnotatorHost } from './annotator_host';
/**
 * TypeScript allows you to write identifiers quoted, like:
 *   interface Foo {
 *     'bar': string;
 *     'complex name': string;
 *   }
 *   Foo.bar;  // ok
 *   Foo['bar']  // ok
 *   Foo['complex name']  // ok
 *
 * In Closure-land, we want identify that the legal name 'bar' can become an
 * ordinary field, but we need to skip strings like 'complex name'.
 */
export declare function isValidClosurePropertyName(name: string): boolean;
/**
 * Determines if fileName refers to a builtin lib.d.ts file.
 * This is a terrible hack but it mirrors a similar thing done in Clutz.
 */
export declare function isDeclaredInBuiltinLibDTS(node: ts.Node | null | undefined): boolean;
/**
 * typeValueConflictHandled returns true for symbols whose type/value conflict
 * is handled outside of tsickle.
 *
 * This covers two cases:
 *
 * - symbols provided by Clutz. Given that Closure has a merged type/value
 * namespace, apparent type/value conflicts on the TypeScript level are actually
 * fine.
 * - builtin lib*.d.ts symbols, such as "Array", which are considered
 * Closure-compatible. Note that we don't actually enforce that the types are
 * actually compatible, but mostly just hope that they are due to being derived
 * from the same HTML specs.
 */
export declare function typeValueConflictHandled(symbol: ts.Symbol): boolean;
/** Returns a string describing the type for usage in debug logs. */
export declare function typeToDebugString(type: ts.Type): string;
/** Returns a string describing the symbol for usage in debug logs. */
export declare function symbolToDebugString(sym: ts.Symbol): string;
/**
 * TypeTranslator translates TypeScript types to Closure types. It keeps state per type, so each
 * translation operation has to create a new instance.
 */
export declare class TypeTranslator {
    private readonly host;
    private readonly typeChecker;
    private readonly node;
    private readonly pathUnknownSymbolsSet;
    private readonly symbolsToAliasedNames;
    private readonly symbolToNameCache;
    private readonly ensureSymbolDeclared;
    /**
     * A list of type literals we've encountered while emitting; used to avoid
     * getting stuck in recursive types.
     */
    private readonly seenTypes;
    /**
     * Whether to write types suitable for an #externs file. Externs types must not refer to
     * non-externs types (i.e. non ambient types) and need to use fully qualified names.
     */
    isForExterns: boolean;
    /**
     * When translating the type of an 'extends' clause, e.g. Y in
     *   class X extends Y<T> { ... }
     * then TS believes there is an additional type argument always passed, as if
     * you had written "extends Y<T, X>".
     * https://github.com/microsoft/TypeScript/issues/38391
     *
     * But we want to emit Y<T> as just Y<T>.  So this flag, when set, causes us
     * to ignore this final generic argument when translating.
     */
    dropFinalTypeArgument: boolean;
    /**
     * @param node is the source AST ts.Node the type comes from.  This is used
     *     in some cases (e.g. anonymous types) for looking up field names.
     * @param pathUnknownSymbolsSet is a set of paths that should never get typed;
     *     any reference to symbols defined in these paths should by typed
     *     as {?}.
     * @param symbolsToAliasedNames a mapping from symbols (`Foo`) to a name in scope they should be
     *     emitted as (e.g. `tsickle_reqType_1.Foo`). Can be augmented during type translation, e.g.
     *     to mark a symbol as unknown.
     */
    constructor(host: AnnotatorHost, typeChecker: ts.TypeChecker, node: ts.Node, pathUnknownSymbolsSet: Set<string>, symbolsToAliasedNames: Map<ts.Symbol, string>, symbolToNameCache: Map<ts.Symbol, string>, ensureSymbolDeclared?: (sym: ts.Symbol) => void);
    /**
     * Converts a ts.Symbol to a string, applying aliases and ensuring symbols are imported.
     * @return a string representation of the symbol as a valid Closure type name, or `undefined` if
     *     the type cannot be expressed (e.g. for anonymous types).
     */
    symbolToString(sym: ts.Symbol): string | undefined;
    /**
     * Returns the mangled name prefix for symbol, or an empty string if not applicable.
     *
     * Type names are emitted with a mangled prefix if they are top level symbols declared in an
     * external module (.d.ts or .ts), and are ambient declarations ("declare ..."). This is because
     * their declarations get moved to externs files (to make external names visible to Closure and
     * prevent renaming), which only use global names. This means the names must be mangled to prevent
     * collisions and allow referencing them uniquely.
     *
     * This method also handles the special case of symbols declared in an ambient external module
     * context.
     *
     * Symbols declared in a global block, e.g. "declare global { type X; }", are handled implicitly:
     * when referenced, they are written as just "X", which is not a top level declaration, so the
     * code below ignores them.
     */
    maybeGetMangledNamePrefix(symbol: ts.Symbol): string | '';
    private stripClutzNamespace;
    translate(type: ts.Type): string;
    private translateUnion;
    private translateUnionMembers;
    private translateEnumLiteral;
    private translateObject;
    /**
     * translateAnonymousType translates a ts.TypeFlags.ObjectType that is also
     * ts.ObjectFlags.Anonymous. That is, this type's symbol does not have a name. This is the
     * anonymous type encountered in e.g.
     *     let x: {a: number};
     * But also the inferred type in:
     *     let x = {a: 1};  // type of x is {a: number}, as above
     */
    private translateAnonymousType;
    /** Converts a ts.Signature (function signature) to a Closure function type. */
    private signatureToClosure;
    /**
     * Converts parameters for the given signature. Takes parameter declarations as those might not
     * match the signature parameters (e.g. there might be an additional this parameter). This
     * difference is handled by the caller, as is converting the "this" parameter.
     */
    private convertParams;
    warn(msg: string): void;
    /** @return true if sym should always have type {?}. */
    isAlwaysUnknownSymbol(symbol: ts.Symbol): boolean;
    /**
     * Closure doesn not support type parameters for function types, i.e. generic function types.
     * Mark the symbols declared by them as unknown and emit a ? for the types.
     *
     * This mutates the given map of unknown symbols. The map's scope is one file, and symbols are
     * unique objects, so this should neither lead to excessive memory consumption nor introduce
     * errors.
     *
     * @param unknownSymbolsMap a map to store the unkown symbols in, with a value of '?'. In practice,
     *     this is always === this.symbolsToAliasedNames, but we're passing it explicitly to make it
     *    clear that the map is mutated (in particular when used from outside the class).
     * @param decls the declarations whose symbols should be marked as unknown.
     */
    markTypeParameterAsUnknown(unknownSymbolsMap: Map<ts.Symbol, string>, decls: ReadonlyArray<ts.TypeParameterDeclaration> | undefined): void;
}
/** @return true if sym should always have type {?}. */
export declare function isAlwaysUnknownSymbol(pathUnknownSymbolsSet: Set<string> | undefined, symbol: ts.Symbol): boolean;
/**
 * Extracts the contained element type from a rest parameter.
 *
 * In TypeScript, a rest parameter is written as an array type:
 *   function f(...xs: number[])
 * while in JS, that same param would be written without the array:
 *   @-param {...number} number
 * This function is used to convert the former into the latter.  It may return
 * undefined in cases where the type is too complex; e.g. TS allows things like
 *   function f<T extends More>(...xs: T)
 */
export declare function restParameterType(typeChecker: ts.TypeChecker, type: ts.Type): ts.Type | undefined;
