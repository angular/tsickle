/**
 * @fileoverview tsickle's Closure compatible exported enum emit does not work in namespaces. Bar
 * below must be exported onto foo, which tsickle does by disabling its emit for namespace'd enums.
 */

// tslint:disable:no-namespace

namespace foo {
  export enum Bar {
    X,
    Y,
  }
  console.log(Bar);  // avoid an "unused assignment" error in Closure.
}

export {foo};
