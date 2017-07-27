// Unlike declare.d.ts, this file is a module.

// "declare global" should show up in the global namespace.
declare global {
  var moduleGlobalX: string;
  namespace moduleGlobalNamespace {
    var y: string;
  }
}

/** This module-scoped export should be put in some namespace and not be global. */
export var moduleExported: string;
/** Despite having no "export", this should also be in the same namespace. */
declare var moduleUnexported: string;
