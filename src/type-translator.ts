/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';
import {toArray} from './util';

/**
 * Determines if fileName refers to a builtin lib.d.ts file.
 * This is a terrible hack but it mirrors a similar thing done in Clutz.
 */
export function isBuiltinLibDTS(fileName: string): boolean {
  return fileName.match(/\blib\.(?:[^/]+\.)?d\.ts$/) != null;
}

/**
 * @return True if the named type is considered compatible with the Closure-defined
 *     type of the same name, e.g. "Array".  Note that we don't actually enforce
 *     that the types are actually compatible, but mostly just hope that they are due
 *     to being derived from the same HTML specs.
 */
function isClosureProvidedType(symbol: ts.Symbol): boolean {
  return symbol.declarations != null &&
      symbol.declarations.some(n => isBuiltinLibDTS(n.getSourceFile().fileName));
}

export function typeToDebugString(type: ts.Type): string {
  let debugString = `flags:0x${type.flags.toString(16)}`;

  // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
  const basicTypes: ts.TypeFlags[] = [
    ts.TypeFlags.Any,           ts.TypeFlags.String,         ts.TypeFlags.Number,
    ts.TypeFlags.Boolean,       ts.TypeFlags.Enum,           ts.TypeFlags.StringLiteral,
    ts.TypeFlags.NumberLiteral, ts.TypeFlags.BooleanLiteral, ts.TypeFlags.EnumLiteral,
    ts.TypeFlags.ESSymbol,      ts.TypeFlags.Void,           ts.TypeFlags.Undefined,
    ts.TypeFlags.Null,          ts.TypeFlags.Never,          ts.TypeFlags.TypeParameter,
    ts.TypeFlags.Object,        ts.TypeFlags.Union,          ts.TypeFlags.Intersection,
    ts.TypeFlags.Index,         ts.TypeFlags.IndexedAccess,  ts.TypeFlags.NonPrimitive,
  ];
  for (const flag of basicTypes) {
    if ((type.flags & flag) !== 0) {
      debugString += ` ${ts.TypeFlags[flag]}`;
    }
  }

  if (type.flags === ts.TypeFlags.Object) {
    const objType = type as ts.ObjectType;
    // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
    const objectFlags: ts.ObjectFlags[] = [
      ts.ObjectFlags.Class,
      ts.ObjectFlags.Interface,
      ts.ObjectFlags.Reference,
      ts.ObjectFlags.Tuple,
      ts.ObjectFlags.Anonymous,
      ts.ObjectFlags.Mapped,
      ts.ObjectFlags.Instantiated,
      ts.ObjectFlags.ObjectLiteral,
      ts.ObjectFlags.EvolvingArray,
      ts.ObjectFlags.ObjectLiteralPatternWithComputedProperties,
    ];
    for (const flag of objectFlags) {
      if ((objType.objectFlags & flag) !== 0) {
        debugString += ` object:${ts.ObjectFlags[flag]}`;
      }
    }
  }

  if (type.symbol && type.symbol.name !== '__type') {
    debugString += ` symbol.name:${JSON.stringify(type.symbol.name)}`;
  }

  if (type.pattern) {
    debugString += ` destructuring:true`;
  }

  return `{type ${debugString}}`;
}

export function symbolToDebugString(sym: ts.Symbol): string {
  let debugString = `${JSON.stringify(sym.name)} flags:0x${sym.flags.toString(16)}`;

  // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
  const symbolFlags = [
    ts.SymbolFlags.FunctionScopedVariable,
    ts.SymbolFlags.BlockScopedVariable,
    ts.SymbolFlags.Property,
    ts.SymbolFlags.EnumMember,
    ts.SymbolFlags.Function,
    ts.SymbolFlags.Class,
    ts.SymbolFlags.Interface,
    ts.SymbolFlags.ConstEnum,
    ts.SymbolFlags.RegularEnum,
    ts.SymbolFlags.ValueModule,
    ts.SymbolFlags.NamespaceModule,
    ts.SymbolFlags.TypeLiteral,
    ts.SymbolFlags.ObjectLiteral,
    ts.SymbolFlags.Method,
    ts.SymbolFlags.Constructor,
    ts.SymbolFlags.GetAccessor,
    ts.SymbolFlags.SetAccessor,
    ts.SymbolFlags.Signature,
    ts.SymbolFlags.TypeParameter,
    ts.SymbolFlags.TypeAlias,
    ts.SymbolFlags.ExportValue,
    ts.SymbolFlags.ExportType,
    ts.SymbolFlags.ExportNamespace,
    ts.SymbolFlags.Alias,
    ts.SymbolFlags.Prototype,
    ts.SymbolFlags.ExportStar,
    ts.SymbolFlags.Optional,
    ts.SymbolFlags.Transient,
  ];
  for (const flag of symbolFlags) {
    if ((sym.flags & flag) !== 0) {
      debugString += ` ${ts.SymbolFlags[flag]}`;
    }
  }

  return debugString;
}

/** TypeTranslator translates TypeScript types to Closure types. */
export class TypeTranslator {
  /**
   * A list of types we've encountered while emitting; used to avoid getting stuck in recursive
   * types.
   */
  private readonly seenTypes: ts.Type[] = [];

  /**
   * Whether to write types suitable for an \@externs file. Externs types must not refer to
   * non-externs types (i.e. non ambient types) and need to use fully qualified names.
   */
  isForExterns = false;

  /**
   * @param node is the source AST ts.Node the type comes from.  This is used
   *     in some cases (e.g. anonymous types) for looking up field names.
   * @param pathBlackList is a set of paths that should never get typed;
   *     any reference to symbols defined in these paths should by typed
   *     as {?}.
   * @param symbolsToPrefix a mapping from symbols (`Foo`) to a prefix they should be emitted with
   *     (`tsickle_import.Foo`).
   */
  constructor(
      private readonly typeChecker: ts.TypeChecker, private readonly node: ts.Node,
      private readonly pathBlackList?: Set<string>,
      private readonly symbolsToAliasedNames = new Map<ts.Symbol, string>()) {
    // Normalize paths to not break checks on Windows.
    if (this.pathBlackList != null) {
      this.pathBlackList =
          new Set<string>(Array.from(this.pathBlackList.values()).map(p => path.normalize(p)));
    }
  }

  /**
   * Converts a ts.Symbol to a string.
   * Other approaches that don't work:
   * - TypeChecker.typeToString translates Array as T[].
   * - TypeChecker.symbolToString emits types without their namespace,
   *   and doesn't let you pass the flag to control that.
   * @param useFqn whether to scope the name using its fully qualified name. Closure's template
   *     arguments are always scoped to the class containing them, where TypeScript's template args
   *     would be fully qualified. I.e. this flag is false for generic types.
   */
  public symbolToString(sym: ts.Symbol, useFqn: boolean): string {
    // This follows getSingleLineStringWriter in the TypeScript compiler.
    let str = '';
    let symAlias = sym;
    if (symAlias.flags & ts.SymbolFlags.Alias) {
      symAlias = this.typeChecker.getAliasedSymbol(symAlias);
    }
    const alias = this.symbolsToAliasedNames.get(symAlias);
    if (alias) return alias;
    if (useFqn && this.isForExterns) {
      // For regular type emit, we can use TypeScript's naming rules, as they match Closure's name
      // scoping rules. However when emitting externs files for ambients, naming rules change. As
      // Closure doesn't support externs modules, all names must be global and use global fully
      // qualified names. The code below uses TypeScript to convert a symbol to a full qualified
      // name and then emits that.
      let fqn = this.typeChecker.getFullyQualifiedName(sym);
      if (fqn.startsWith(`"`) || fqn.startsWith(`'`)) {
        // Quoted FQNs mean the name is from a module, e.g. `'path/to/module'.some.qualified.Name`.
        // tsickle generally re-scopes names in modules that are moved to externs into the global
        // namespace. That does not quite match TS' semantics where ambient types from modules are
        // local. However value declarations that are local to modules but not defined do not make
        // sense if not global, e.g. "declare class X {}; new X();" cannot work unless `X` is
        // actually a global.
        // So this code strips the module path from the type and uses the FQN as a global.
        fqn = fqn.replace(/^["'][^"']+['"]\./, '');
      }
      // Declarations in module can re-open global types using "declare global { ... }". The fqn
      // then contains the prefix "global." here. As we're mapping to global types, just strip the
      // prefix.
      const isInGlobal = (sym.declarations || []).some(d => {
        let current: ts.Node|undefined = d;
        while (current) {
          if (current.flags & ts.NodeFlags.GlobalAugmentation) return true;
          current = current.parent;
        }
        return false;
      });
      if (isInGlobal) {
        fqn = fqn.replace(/^global\./, '');
      }
      return this.stripClutzNamespace(fqn);
    }
    const writeText = (text: string) => str += text;
    const doNothing = () => {
      return;
    };

    const builder = this.typeChecker.getSymbolDisplayBuilder();
    const writer: ts.SymbolWriter = {
      writeKeyword: writeText,
      writeOperator: writeText,
      writePunctuation: writeText,
      writeSpace: writeText,
      writeStringLiteral: writeText,
      writeParameter: writeText,
      writeProperty: writeText,
      writeSymbol: writeText,
      writeLine: doNothing,
      increaseIndent: doNothing,
      decreaseIndent: doNothing,
      clear: doNothing,
      trackSymbol(symbol: ts.Symbol, enclosingDeclaration?: ts.Node, meaning?: ts.SymbolFlags) {
        return;
      },
      reportInaccessibleThisError: doNothing,
      reportPrivateInBaseOfClassExpression: doNothing,
    };
    builder.buildSymbolDisplay(sym, writer, this.node);
    return this.stripClutzNamespace(str);
  }

  // Clutz (https://github.com/angular/clutz) emits global type symbols hidden in a special
  // ಠ_ಠ.clutz namespace. While most code seen by Tsickle will only ever see local aliases, Clutz
  // symbols can be written by users directly in code, and they can appear by dereferencing
  // TypeAliases. The code below simply strips the prefix, the remaining type name then matches
  // Closure's type.
  private stripClutzNamespace(name: string) {
    if (name.startsWith('ಠ_ಠ.clutz.')) return name.substring('ಠ_ಠ.clutz.'.length);
    return name;
  }

  translate(type: ts.Type): string {
    // NOTE: Though type.flags has the name "flags", it usually can only be one
    // of the enum options at a time (except for unions of literal types, e.g. unions of boolean
    // values, string values, enum values). This switch handles all the cases in the ts.TypeFlags
    // enum in the order they occur.

    // NOTE: Some TypeFlags are marked "internal" in the d.ts but still show up in the value of
    // type.flags. This mask limits the flag checks to the ones in the public API. "lastFlag" here
    // is the last flag handled in this switch statement, and should be kept in sync with
    // typescript.d.ts.

    // NonPrimitive occurs on its own on the lower case "object" type. Special case to "!Object".
    if (type.flags === ts.TypeFlags.NonPrimitive) return '!Object';

    let isAmbient = false;
    let isNamespace = false;
    let isModule = false;
    if (type.symbol) {
      for (const decl of type.symbol.declarations || []) {
        if (ts.isExternalModule(decl.getSourceFile())) isModule = true;
        let current: ts.Node|undefined = decl;
        while (current) {
          if (ts.getCombinedModifierFlags(current) & ts.ModifierFlags.Ambient) isAmbient = true;
          if (current.kind === ts.SyntaxKind.ModuleDeclaration) isNamespace = true;
          current = current.parent;
        }
      }
    }

    // tsickle cannot generate types for non-ambient namespaces.
    if (isNamespace && !isAmbient) return '?';

    // Types in externs cannot reference types from external modules.
    // However ambient types in modules get moved to externs, too, so type references work and we
    // can emit a precise type.
    if (this.isForExterns && isModule && !isAmbient) return '?';

    const lastFlag = ts.TypeFlags.IndexedAccess;
    const mask = (lastFlag << 1) - 1;
    switch (type.flags & mask) {
      case ts.TypeFlags.Any:
        return '?';
      case ts.TypeFlags.String:
      case ts.TypeFlags.StringLiteral:
        return 'string';
      case ts.TypeFlags.Number:
      case ts.TypeFlags.NumberLiteral:
        return 'number';
      case ts.TypeFlags.Boolean:
      case ts.TypeFlags.BooleanLiteral:
        // See the note in translateUnion about booleans.
        return 'boolean';
      case ts.TypeFlags.Enum:
        if (!type.symbol) {
          this.warn(`EnumType without a symbol`);
          return '?';
        }
        return this.symbolToString(type.symbol, true);
      case ts.TypeFlags.ESSymbol:
        // NOTE: currently this is just a typedef for {?}, shrug.
        // https://github.com/google/closure-compiler/blob/55cf43ee31e80d89d7087af65b5542aa63987874/externs/es3.js#L34
        return 'symbol';
      case ts.TypeFlags.Void:
        return 'void';
      case ts.TypeFlags.Undefined:
        return 'undefined';
      case ts.TypeFlags.Null:
        return 'null';
      case ts.TypeFlags.Never:
        this.warn(`should not emit a 'never' type`);
        return '?';
      case ts.TypeFlags.TypeParameter:
        // This is e.g. the T in a type like Foo<T>.
        if (!type.symbol) {
          this.warn(`TypeParameter without a symbol`);  // should not happen (tm)
          return '?';
        }
        // In Closure Compiler, type parameters *are* scoped to their containing class.
        const useFqn = false;
        return this.symbolToString(type.symbol, useFqn);
      case ts.TypeFlags.Object:
        return this.translateObject(type as ts.ObjectType);
      case ts.TypeFlags.Union:
        return this.translateUnion(type as ts.UnionType);
      case ts.TypeFlags.Intersection:
      case ts.TypeFlags.Index:
      case ts.TypeFlags.IndexedAccess:
        // TODO(ts2.1): handle these special types.
        this.warn(`unhandled type flags: ${ts.TypeFlags[type.flags]}`);
        return '?';
      default:
        // Handle cases where multiple flags are set.

        // Types with literal members are represented as
        //   ts.TypeFlags.Union | [literal member]
        // E.g. an enum typed value is a union type with the enum's members as its members. A
        // boolean type is a union type with 'true' and 'false' as its members.
        // Note also that in a more complex union, e.g. boolean|number, then it's a union of three
        // things (true|false|number) and ts.TypeFlags.Boolean doesn't show up at all.
        if (type.flags & ts.TypeFlags.Union) {
          return this.translateUnion(type as ts.UnionType);
        }

        if (type.flags & ts.TypeFlags.EnumLiteral) {
          return this.translateEnumLiteral(type);
        }

        // The switch statement should have been exhaustive.
        throw new Error(`unknown type flags ${type.flags} on ${typeToDebugString(type)}`);
    }
  }

  private translateUnion(type: ts.UnionType): string {
    let parts = type.types.map(t => this.translate(t));
    // Union types that include literals (e.g. boolean, enum) can end up repeating the same Closure
    // type. For example: true | boolean will be translated to boolean | boolean.
    // Remove duplicates to produce types that read better.
    parts = parts.filter((el, idx) => parts.indexOf(el) === idx);
    return parts.length === 1 ? parts[0] : `(${parts.join('|')})`;
  }

  private translateEnumLiteral(type: ts.Type): string {
    // Suppose you had:
    //   enum EnumType { MEMBER }
    // then the type of "EnumType.MEMBER" is an enum literal (the thing passed to this function)
    // and it has type flags that include
    //   ts.TypeFlags.NumberLiteral | ts.TypeFlags.EnumLiteral
    //
    // Closure Compiler doesn't support literals in types, so this code must not emit
    // "EnumType.MEMBER", but rather "EnumType".

    const enumLiteralBaseType = this.typeChecker.getBaseTypeOfLiteralType(type);
    if (!enumLiteralBaseType.symbol) {
      this.warn(`EnumLiteralType without a symbol`);
      return '?';
    }
    return this.symbolToString(enumLiteralBaseType.symbol, true);
  }

  // translateObject translates a ts.ObjectType, which is the type of all
  // object-like things in TS, such as classes and interfaces.
  private translateObject(type: ts.ObjectType): string {
    if (type.symbol && this.isBlackListed(type.symbol)) return '?';

    // NOTE: objectFlags is an enum, but a given type can have multiple flags.
    // Array<string> is both ts.ObjectFlags.Reference and ts.ObjectFlags.Interface.

    if (type.objectFlags & ts.ObjectFlags.Class) {
      if (!type.symbol) {
        this.warn('class has no symbol');
        return '?';
      }
      return '!' + this.symbolToString(type.symbol, /* useFqn */ true);
    } else if (type.objectFlags & ts.ObjectFlags.Interface) {
      // Note: ts.InterfaceType has a typeParameters field, but that
      // specifies the parameters that the interface type *expects*
      // when it's used, and should not be transformed to the output.
      // E.g. a type like Array<number> is a TypeReference to the
      // InterfaceType "Array", but the "number" type parameter is
      // part of the outer TypeReference, not a typeParameter on
      // the InterfaceType.
      if (!type.symbol) {
        this.warn('interface has no symbol');
        return '?';
      }
      if (type.symbol.flags & ts.SymbolFlags.Value) {
        // The symbol is both a type and a value.
        // For user-defined types in this state, we don't have a Closure name
        // for the type.  See the type_and_value test.
        if (!isClosureProvidedType(type.symbol)) {
          this.warn(`type/symbol conflict for ${type.symbol.name}, using {?} for now`);
          return '?';
        }
      }
      return '!' + this.symbolToString(type.symbol, /* useFqn */ true);
    } else if (type.objectFlags & ts.ObjectFlags.Reference) {
      // A reference to another type, e.g. Array<number> refers to Array.
      // Emit the referenced type and any type arguments.
      const referenceType = type as ts.TypeReference;

      // A tuple is a ReferenceType where the target is flagged Tuple and the
      // typeArguments are the tuple arguments.  Just treat it as a mystery
      // array, because Closure doesn't understand tuples.
      if (referenceType.target.objectFlags & ts.ObjectFlags.Tuple) {
        return '!Array<?>';
      }

      let typeStr = '';
      if (referenceType.target === referenceType) {
        // We get into an infinite loop here if the inner reference is
        // the same as the outer; this can occur when this function
        // fails to translate a more specific type before getting to
        // this point.
        throw new Error(
            `reference loop in ${typeToDebugString(referenceType)} ${referenceType.flags}`);
      }
      typeStr += this.translate(referenceType.target);
      // Translate can return '?' for a number of situations, e.g. type/value conflicts.
      // `?<?>` is illegal syntax in Closure Compiler, so just return `?` here.
      if (typeStr === '?') return '?';
      if (referenceType.typeArguments) {
        const params = referenceType.typeArguments.map(t => this.translate(t));
        typeStr += `<${params.join(', ')}>`;
      }
      return typeStr;
    } else if (type.objectFlags & ts.ObjectFlags.Anonymous) {
      if (!type.symbol) {
        // This comes up when generating code for an arrow function as passed
        // to a generic function.  The passed-in type is tagged as anonymous
        // and has no properties so it's hard to figure out what to generate.
        // Just avoid it for now so we don't crash.
        this.warn('anonymous type has no symbol');
        return '?';
      }

      if (type.symbol.flags & ts.SymbolFlags.TypeLiteral) {
        return this.translateTypeLiteral(type);
      } else if (
          type.symbol.flags & ts.SymbolFlags.Function ||
          type.symbol.flags & ts.SymbolFlags.Method) {
        const sigs = this.typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
        if (sigs.length === 1) {
          return this.signatureToClosure(sigs[0]);
        }
      }
      this.warn('unhandled anonymous type');
      return '?';
    }

    /*
    TODO(ts2.1): more unhandled object type flags:
      Tuple
      Mapped
      Instantiated
      ObjectLiteral
      EvolvingArray
      ObjectLiteralPatternWithComputedProperties
    */
    this.warn(`unhandled type ${typeToDebugString(type)}`);
    return '?';
  }

  /**
   * translateTypeLiteral translates a ts.SymbolFlags.TypeLiteral type, which
   * is the anonymous type encountered in e.g.
   *   let x: {a: number};
   */
  private translateTypeLiteral(type: ts.Type): string {
    // Avoid infinite loops on recursive types.
    // It would be nice to just emit the name of the recursive type here,
    // but type.symbol doesn't seem to have the name here (perhaps something
    // to do with aliases?).
    if (this.seenTypes.indexOf(type) !== -1) return '?';
    this.seenTypes.push(type);

    // Gather up all the named fields and whether the object is also callable.
    let callable = false;
    let indexable = false;
    const fields: string[] = [];
    if (!type.symbol || !type.symbol.members) {
      this.warn('type literal has no symbol');
      return '?';
    }

    // special-case construct signatures.
    const ctors = type.getConstructSignatures();
    if (ctors.length) {
      // TODO(martinprobst): this does not support additional properties defined on constructors
      // (not expressible in Closure), nor multiple constructors (same).
      const params = this.convertParams(ctors[0]);
      const paramsStr = params.length ? (', ' + params.join(', ')) : '';
      const constructedType = this.translate(ctors[0].getReturnType());
      // In the specific case of the "new" in a function, it appears that
      //   function(new: !Bar)
      // fails to parse, while
      //   function(new: (!Bar))
      // parses in the way you'd expect.
      // It appears from testing that Closure ignores the ! anyway and just
      // assumes the result will be non-null in either case.  (To be pedantic,
      // it's possible to return null from a ctor it seems like a bad idea.)
      return `function(new: (${constructedType})${paramsStr}): ?`;
    }

    for (const field of toArray(type.symbol.members.keys())) {
      switch (field) {
        case '__call':
          callable = true;
          break;
        case '__index':
          indexable = true;
          break;
        default:
          const member = type.symbol.members.get(field)!;
          // optional members are handled by the type including |undefined in a union type.
          const memberType =
              this.translate(this.typeChecker.getTypeOfSymbolAtLocation(member, this.node));
          fields.push(`${field}: ${memberType}`);
          break;
      }
    }

    // Try to special-case plain key-value objects and functions.
    if (fields.length === 0) {
      if (callable && !indexable) {
        // A function type.
        const sigs = this.typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
        if (sigs.length === 1) {
          return this.signatureToClosure(sigs[0]);
        }
      } else if (indexable && !callable) {
        // A plain key-value map type.
        let keyType = 'string';
        let valType = this.typeChecker.getIndexTypeOfType(type, ts.IndexKind.String);
        if (!valType) {
          keyType = 'number';
          valType = this.typeChecker.getIndexTypeOfType(type, ts.IndexKind.Number);
        }
        if (!valType) {
          this.warn('unknown index key type');
          return `!Object<?,?>`;
        }
        return `!Object<${keyType},${this.translate(valType)}>`;
      } else if (!callable && !indexable) {
        // Special-case the empty object {} because Closure doesn't like it.
        // TODO(evanm): revisit this if it is a problem.
        return '!Object';
      }
    }

    if (!callable && !indexable) {
      // Not callable, not indexable; implies a plain object with fields in it.
      return `{${fields.join(', ')}}`;
    }

    this.warn('unhandled type literal');
    return '?';
  }

  /** Converts a ts.Signature (function signature) to a Closure function type. */
  private signatureToClosure(sig: ts.Signature): string {
    const params = this.convertParams(sig);
    let typeStr = `function(${params.join(', ')})`;

    const retType = this.translate(this.typeChecker.getReturnTypeOfSignature(sig));
    if (retType) {
      typeStr += `: ${retType}`;
    }

    return typeStr;
  }

  private convertParams(sig: ts.Signature): string[] {
    return sig.parameters.map(param => {
      const paramType = this.typeChecker.getTypeOfSymbolAtLocation(param, this.node);
      return this.translate(paramType);
    });
  }

  warn(msg: string) {
    // By default, warn() does nothing.  The caller will overwrite this
    // if it wants different behavior.
  }

  /** @return true if sym should always have type {?}. */
  isBlackListed(symbol: ts.Symbol): boolean {
    if (this.pathBlackList === undefined) return false;
    const pathBlackList = this.pathBlackList;
    // Some builtin types, such as {}, get represented by a symbol that has no declarations.
    if (symbol.declarations === undefined) return false;
    return symbol.declarations.every(n => {
      const fileName = path.normalize(n.getSourceFile().fileName);
      return pathBlackList.has(fileName);
    });
  }
}
