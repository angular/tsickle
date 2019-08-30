/**
 * This test is simulating what it's like when someone augments a module. The
 * interesting output is the generated externs.
 *
 * It's called "zz_angular" to make sure its externs are concatenated after
 * 'angular/index.d.ts'. This simulates that in a normal build setup, this file
 * would be in a separate compilation unit and depend on angular/index.dts, so
 * the generated externs would be ordered by the build system.
 */

import * as localAlias from './angular';

declare module './angular' {
  /**
   * sub is a namespace that exists in angular already; this file is
   * augmenting it.
   */
  namespace sub {
    interface AugmentSubType {
      prop: string
    }
  }

  /**
   * local is a new namespace introduced by this file.
   */
  namespace local {
    type LocalType = string;
    type UsingSymbolFromAugmentedModule = localAlias.Scope;
  }
}
