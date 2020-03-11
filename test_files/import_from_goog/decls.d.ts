// Matches ./closure_Module.js
declare module 'goog:closure.Module' {
  class X {}
  export default X;
}

// Matches ./closure_OtherModule.js
declare module 'goog:closure.OtherModule' {
  class SymA {}
  class SymB {}
  export {SymA, SymB};
}

// Matches ./closure_LegacyModule.js
declare namespace ಠ_ಠ.clutz.closure.LegacyModule {
  export import LegacyExport = ಠ_ಠ.clutz.module$contents$closure$LegacyModule_LegacyExport ;
}
declare module 'goog:closure.LegacyModule' {
  import LegacyModule = ಠ_ಠ.clutz.closure.LegacyModule;
  export = LegacyModule;
}
declare namespace ಠ_ಠ.clutz {
  interface module$contents$closure$LegacyModule_LegacyExport {}
}
