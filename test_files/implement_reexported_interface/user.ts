/**
 * @fileoverview Tests that a re-exported interface can be implemented.
 *
 * This reproduces a bug where tsickle would define re-exports as just
 * "ExportedInterface", not "!ExportedInterface", which would then crash Closure
 * Compiler as it creates a union type, which is unexpected for super
 * interfaces.
 */

import {ExportedInterface} from './exporter';

// Note: in principle the emit here really ought to only refer to
// the 'exporter' module, but it ends up also referring to the module undereath
// it. This is because for constructing the @implements clause we examine the
// *type* of ExportedInterface and then compute a name for it, and the type is
// resolved through aliases.
class Test implements ExportedInterface {
  fooStr = 'a';
}
