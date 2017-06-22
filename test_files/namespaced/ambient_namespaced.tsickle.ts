/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

declare namespace decl.ns.one {
  export class NamespacedClass {
    x: decl.ns.two.NamespacedClass;
    y: NamespacedClass;
  }
}

declare namespace decl.ns.two {
  export class NamespacedClass {
    x: NamespacedClass;
    y: decl.ns.one.NamespacedClass;
  }
}

let /** @type {!decl.ns.one.NamespacedClass} */ user: decl.ns.one.NamespacedClass;
