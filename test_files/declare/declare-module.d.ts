// Unlike declare.d.ts, this file is a module.

// "declare global" should show up in the global namespace.
declare global {
  var globalX: string;
  export class GlobalClass {}
  export namespace globalNamespace {
    var Y: string;
    export class GlobalNamespaced {}
  }
}

// TODO(evmar): this module-scoped export should be put in some namespace,
// and not be global.
export var exported: string;
