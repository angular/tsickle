// Unlike declare.d.ts, this file is a module.

// Symbols declared with a "declare global" should show up in the global
// namespace, as if they were declared in a script.
declare global {
  var moduleGlobalX: string;
  export class ModuleGlobalClass {}
  namespace moduleGlobalNamespace {
    var y: string;
    export class GlobalNamespaced {}
  }
}

// TODO(evmar): this module-scoped export should be put in some namespace,
// and not be global.
export var moduleExported: string;
// Despite having no "export", this should also be in the same namespace.
declare var moduleUnexported: string;
