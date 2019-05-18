/**
 * @fileoverview This file uses a type alias that references a type defined in another file. The
 * test makes sure there is no hard goog.require for the transitive file, as that breaks strict
 * dependency checking in some systems.
 */

import {UsesExportedInterface} from './reexporter';

export const val: UsesExportedInterface = 'val';
