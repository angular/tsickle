declare namespace ಠ_ಠ.clutz {
  namespace proto.test_files.inline_reexport_module_augmentation.no_externs.named {
    export class FooMsg {
      private noStructuralTyping_proto$test_files$inline_reexport_module_augmentation$no_externs$named$FooMsg: {};
    }
  }
}

declare module 'goog:proto.test_files.inline_reexport_module_augmentation.no_externs.named.FooMsg' {
  import FooMsg = ಠ_ಠ.clutz.proto.test_files.inline_reexport_module_augmentation.no_externs.named.FooMsg;
  export default FooMsg;
  const __clutz2_actual_path: 'test_files/inline_reexport_module_augmentation.no_externs/named_jspb/FooMsg';
}

declare module 'test_files/inline_reexport_module_augmentation.no_externs/named_jspb/FooMsg' {
  import FooMsg = ಠ_ಠ.clutz.proto.test_files.inline_reexport_module_augmentation.no_externs.named.FooMsg;
  export {FooMsg};
  const __clutz_strip_property: 'FooMsg';
  const __clutz_actual_namespace: 'proto.test_files.inline_reexport_module_augmentation.no_externs.named.FooMsg';
}
