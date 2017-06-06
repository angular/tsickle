// Unlike declare.d.ts, this file is a module.

// "declare global" should show up in the global namespace.
declare global {
  var globalX: string;
  namespace subnamespace {
    var Y: string;
  }
}

// TODO(evmar): this module-scoped export should be put in some namespace,
// and not be global.
export var exported: string;
