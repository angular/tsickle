/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview Minimal type declarations for the chai-diff library.
 * @see https://www.npmjs.com/package/chai-diff
 */

declare namespace Chai {
  interface Assertion {
    differentFrom(val: string, opts?: {}): void;
  }
}

declare module 'chai-diff' {
  // tslint:disable-next-line:no-any This is the type defined by chai.use.
  function chaiDiff(chai: any, utils: any): void;
  export = chaiDiff;
}
