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

let user: decl.ns.one.NamespacedClass;
