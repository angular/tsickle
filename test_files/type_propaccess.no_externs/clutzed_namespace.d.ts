declare namespace ಠ_ಠ.clutz.type_propaccess.nested.clazz {
  class ClutzedClassWithNested {}
  namespace ClutzedClassWithNested {
    export class NestedClutzedClass {}
  }
}

declare module 'goog:type_propaccess.nested.clazz' {
  import alias = ಠ_ಠ.clutz.type_propaccess.nested.clazz;
  export = alias;
}
