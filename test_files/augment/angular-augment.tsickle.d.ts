/**
 * This test is simulating what it's like when someone augments a module.
 * The interesting output is the generated externs.
 */

import * as angular from './angular';

declare module './angular' {
  /**
   * sub is a namespace that exists in angular already; this file is
   * augmenting it.
   */
  namespace sub {
    type AugmentSubType = string;
  }

  /**
   * sub is a new namespace introduced by this file.
   */
  namespace local {
    type LocalType = string;
  }
}
