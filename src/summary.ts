/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** The Type of an import, as used in JsTrimmer. */
export enum Type {
  UNKNOWN = 0,
  /** The symbol type for Closure namespace. */
  CLOSURE,
  /** The symbol type for a GSS namespace. */
  GSS,
  /** The symbol type for a Soy namespace. */
  SOY,
  /** The symbol type for an extensionless google3-relative CSS/GSS path. */
  CSSPATH,
  /** The symbol type for a google3-relative ES module path. */
  ESPATH,
}

/** The module system used by a file. */
export enum ModuleType {
  UNKNOWN = 0,
  GOOG_PROVIDE,
  GOOG_MODULE,
  ES_MODULE,
}

/** A single imported symbol. */
export interface Symbol {
  type: Type;
  name: string;
}

/**
 * The JsTrimmer file summary for a single file.  Contains imported and
 * exported symbols, as well as some other information required for sorting and
 * pruning files.
 */
export class FileSummary {
  // These sets are implemented as Maps of jsonified Symbol to Symbol because
  // JavaScript Sets use object address, not object contents.  Similarly, we use
  // getters and setters for these to hide this implementation detail.
  private readonly provideSet = new Map<string, Symbol>();
  private readonly strongRequireSet = new Map<string, Symbol>();
  private readonly weakRequireSet = new Map<string, Symbol>();
  private readonly dynamicRequireSet = new Map<string, Symbol>();
  private readonly modSet = new Map<string, Symbol>();
  private readonly enhancedSet = new Map<string, Symbol>();
  toggles: string[] = [];
  modName: string|undefined;
  autochunk = false;
  enhanceable = false;
  moduleType = ModuleType.UNKNOWN;

  private stringify(symbol: Symbol): string {
    return JSON.stringify(symbol);
  }

  addProvide(provide: Symbol) {
    this.provideSet.set(this.stringify(provide), provide);
  }

  get provides(): Symbol[] {
    return [...this.provideSet.values()];
  }

  addStrongRequire(strongRequire: Symbol) {
    this.strongRequireSet.set(this.stringify(strongRequire), strongRequire);
  }

  get strongRequires(): Symbol[] {
    return [...this.strongRequireSet.values()];
  }

  addWeakRequire(weakRequire: Symbol) {
    this.weakRequireSet.set(this.stringify(weakRequire), weakRequire);
  }

  get weakRequires(): Symbol[] {
    const weakRequires = [];
    for (const [k, v] of this.weakRequireSet.entries()) {
      if (this.strongRequireSet.has(k)) continue;
      weakRequires.push(v);
    }
    return weakRequires;
  }

  addDynamicRequire(dynamicRequire: Symbol) {
    this.dynamicRequireSet.set(this.stringify(dynamicRequire), dynamicRequire);
  }

  get dynamicRequires(): Symbol[] {
    return [...this.dynamicRequireSet.values()];
  }

  addMods(mods: Symbol) {
    this.modSet.set(this.stringify(mods), mods);
  }

  get mods(): Symbol[] {
    return [...this.modSet.values()];
  }

  addEnhanced(enhanced: Symbol) {
    this.enhancedSet.set(this.stringify(enhanced), enhanced);
  }

  get enhanced(): Symbol[] {
    return [...this.enhancedSet.values()];
  }
}

/** Provides dependencies for file generation. */
export interface SummaryGenerationProcessorHost {
  /** @deprecated use unknownTypesPaths instead */
  typeBlackListPaths?: Set<string>;
  /** If provided, a set of paths whose types should always generate as {?}. */
  unknownTypesPaths?: Set<string>;
  /** See compiler_host.ts */
  rootDirsRelative(fileName: string): string;
  /**
   * Whether to convert CommonJS require() imports to goog.module() and
   * goog.require() calls.
   */
  googmodule: boolean;
}
