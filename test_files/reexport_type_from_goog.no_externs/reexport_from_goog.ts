/**
 * @fileoverview A module that re-exports a Closure module.
 * @suppress {checkTypes}
 */

import ClosureModule from 'goog:closure.types.Module';
import {SymA, SymB} from 'goog:closure.types.OtherModule';
import {LegacyExport} from 'goog:closure.types.LegacyModule';

export type LocalClosureModule = ClosureModule;
export type LocalSymA = SymA;
export type LocalLegacyExport = LegacyExport;
