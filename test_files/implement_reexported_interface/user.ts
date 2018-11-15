/**
 * @fileoverview Tests that a re-exported interface can be implemented. This reproduces a bug where
 * tsickle would define re-exports as just "ExportedInterface", not "!ExportedInterface", which
 * would then crash Closure Compiler as it creates a union type, which is unexpected for super
 * interfaces.
 *
 * Note also that the output .js should not directly reference the 'interface' module, because this
 * module does not import from it.
 */

import {ExportedInterface} from './exporter';

class Test implements ExportedInterface {
  fooStr = 'a';
}
