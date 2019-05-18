declare namespace ಠ_ಠ.clutz.some.name.space {
  class ClutzedClass { field: ಠ_ಠ.clutz.some.other.TypeAlias; }
  function clutzedFn(param: ಠ_ಠ.clutz.some.other.TypeAlias);
}

declare module 'goog:some.name.space' {
  import alias = ಠ_ಠ.clutz.some.name.space;
  export = alias;
}

declare namespace ಠ_ಠ.clutz.some.other {
  type TypeAlias = ClutzedInterface;
  interface ClutzedInterface { field: string; }
}

declare module 'goog:some.other' {
  import alias = ಠ_ಠ.clutz.some.other;
  export = alias;
}
