/**
 * @fileoverview This test is to verify that an interface that has been
 * extended via declaration merging is still usable as an interface.
 */

// Simple implementation of a type+value.
// We expect an @implements to show in the output.
class C1 implements export_import.IFace {
  a = 'a';
}

// Simple implementation of a type+value that is indirected through an
// 'export import' clause.
// We expect an @implements to show in the output.
class C2 implements export_import.Reexport.Reexported {
  a = 'a';
}
