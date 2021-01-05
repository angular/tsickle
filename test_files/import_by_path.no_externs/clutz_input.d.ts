// Mocks for Clutz-generated .d.ts.

// A plain module containing a default export.
declare namespace ಠ_ಠ.clutz.my.module {
  class MyClassDefaultExport {
    someField: number;
  }
}
declare module 'goog:my.module' {
import MyClassDefaultExport = ಠ_ಠ.clutz.my.module.MyClassDefaultExport;
  export default MyClassDefaultExport;
}
declare module 'google3/path/to/file' {
import MyClassDefaultExport = ಠ_ಠ.clutz.my.module.MyClassDefaultExport;
  // Note: default export converted to a named export below.
  export {MyClassDefaultExport};
  const __clutz_actual_namespace: 'my.module';
  const __clutz_strip_property: 'MyClassDefaultExport';
}

// A module containing a named export.
declare namespace ಠ_ಠ.clutz.other.module {
  function someFunction(x: number): number;
}
declare module 'goog:other.module' {
import module = ಠ_ಠ.clutz.other.module;
  export = module;
}
declare module 'google3/path/to/otherfile' {
import someFunction = ಠ_ಠ.clutz.other.module.someFunction;
  export {someFunction};
  const __clutz_actual_namespace: 'other.module';
}

// A module export a (named) type.
declare namespace ಠ_ಠ.clutz.type.module {
  type SomeType = number;
}
declare module 'goog:type.module' {
import SomeType = ಠ_ಠ.clutz.type.module.SomeType;
  export {SomeType};
}
declare module 'google3/path/to/typeonly' {
import SomeType = ಠ_ಠ.clutz.type.module.SomeType;
  export {SomeType};
  const __clutz_actual_namespace: 'type.module';
}

// A module containing multiple provides.
// This models Clutz' emit, the key element is the __clutz_multiple_provides.
declare namespace ಠ_ಠ.clutz.multiple.provides {
  class Nesting {}
}
declare module 'goog:multiple.provides.Nesting' {
import Nesting = ಠ_ಠ.clutz.multiple.provides.Nesting;
  export default Nesting;
}
declare module 'google3/path/to/multiple_provides/nesting' {
import Nesting = ಠ_ಠ.clutz.multiple.provides.Nesting;
  export {Nesting};
  const __clutz_actual_namespace: 'multiple.provides.Nesting';
  const __clutz_strip_property: 'Nesting';
}
declare namespace ಠ_ಠ.clutz.multiple.provides.Nesting {
  class Inner {}
}
declare module 'goog:multiple.provides.Nesting.Inner' {
import Inner = ಠ_ಠ.clutz.multiple.provides.Nesting.Inner;
  export default Inner;
}

declare namespace ಠ_ಠ.clutz.multiple.provides.conflicting.a {
  const value: number;
}
declare module 'goog:multiple.provides.conflicting.a' {
import value = ಠ_ಠ.clutz.multiple.provides.conflicting.a.value;
  export {value};
}
declare module 'google3/path/to/multiple_provides/conflicting' {
import value = ಠ_ಠ.clutz.multiple.provides.conflicting.a.value;
  export {value};
  const __clutz_actual_namespace: 'multiple.provides.conflicting.a';
}
declare namespace ಠ_ಠ.clutz.multiple.provides.conflicting.b {
  const value2: number;
}
declare module 'goog:multiple.provides.conflicting.b' {
import value2 = ಠ_ಠ.clutz.multiple.provides.conflicting.b.value2;
  export {value2};
}
declare module 'google3/path/to/multiple_provides/conflicting' {
  export {};
  const __clutz_multiple_provides: true;
}
// Models the emit of Clutz for a file that contains conflicting goog.provides
// and exports a type. The key piece is the `__clutz_multiple_provides` property
// that's emitted by Clutz when it finds multiple conflicting provides in a
// file.
declare namespace ಠ_ಠ.clutz.multiple.provides.conflicting {
  interface Type { x: number; }
}
declare module 'goog:multiple.provides.conflicting.Type' {
import Type = ಠ_ಠ.clutz.multiple.provides.conflicting.Type;
  export {Type};
}
declare module 'google3/path/to/multiple_provides/conflicting' {
import Type = ಠ_ಠ.clutz.multiple.provides.conflicting.Type;
  export {Type};
  const __clutz_multiple_provides: true;
}
