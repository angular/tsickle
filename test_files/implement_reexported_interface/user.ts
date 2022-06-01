/**
 * @fileoverview Tests that a re-exported interface can be implemented.
 *
 * This reproduces a bug where tsickle would define re-exports as just
 * "ExportedInterface", not "!ExportedInterface", which would then crash Closure
 * Compiler as it creates a union type, which is unexpected for super
 * interfaces.
 *
 * @suppress {uselessCode}
 */

import {ExportedInterface} from './exporter';

class Test implements ExportedInterface {
  fooStr = 'a';
}
