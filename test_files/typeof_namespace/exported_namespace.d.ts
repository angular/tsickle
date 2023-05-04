declare namespace fooNs {
  const prop: string;
}

// TODO: b/280338932 - Emits {?}, but should emit {typeof test_files$...namespace.foo}
export type foo = typeof fooNs;
