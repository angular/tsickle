// Mocks for Clutz-generated .d.ts.

declare namespace ಠ_ಠ.clutz.another.module {
  export class SomeClass {}
}
declare module 'goog:another.module' {
import SomeClass = ಠ_ಠ.clutz.another.module.SomeClass;
  export {SomeClass};
}
declare module 'google3/another/file' {
import SomeClass = ಠ_ಠ.clutz.another.module.SomeClass;
  export {SomeClass};
  const __clutz_actual_namespace: 'another.module';
}
