export {};

// Verify we don't produce a type mentioning 'anonymous class'
// for variables that involve anonymous classes.  Instead we just
// produce {?}.
const anonClassInstance = new class { foo: string; };

// Verify the same thing in a namespace.
// We don't rely on namespaces really but the logic around generating type
// names has some logic near namespaces so we might as well verify the output
// looks ok.
namespace ns {
  export const anonInstance2 = new class { foo: string; };
  export const anonClass = class { foo: string; };
}
const aliasToAnon = ns.anonInstance2;
const anonClassNs = new ns.anonClass();
