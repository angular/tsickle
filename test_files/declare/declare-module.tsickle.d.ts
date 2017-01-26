// Unlike declare.d.ts, this file is a module.
export var exported: string;

// Now "declare global" should show up in the global namespace.
declare global {
  var globalX: string;
  namespace subnamespace {
    var Y: string;
  }
}
