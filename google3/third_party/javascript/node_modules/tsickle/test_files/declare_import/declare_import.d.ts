/**
 * @fileoverview declare import tests that imports in .d.ts resolve to the correct result names. See
 * externs.ts addImportAliases.
 *
 * The code below tests mixing symbols from .d.ts and .ts files, to make sure type references are
 * uniformly generated.
 */

import LocalClosureClassName from 'goog:imported.closure.Class';

import ExportDefaultClass from './export_default';
import * as prefix from './exporter';
import {ExportedClass} from './exporter';
import {RenamedExportedClass as Renamed} from './exporter';
import importEquals = require('./exporter');
import {ExportedFromDts} from './exporting';

export declare class ExtendsImported extends ExportedClass {}
export declare class ExtendsPrefixedImported extends prefix.PrefixedExportedClass {}
export declare class ExtendsImportDefault extends ExportDefaultClass {}
export declare class ExtendsRenamedImported extends Renamed {}
export declare class ExtendsLocalClosureClassName extends LocalClosureClassName {}
export declare class ExtendsImportEquals extends importEquals.ImportEqualsExportedClass {}
export declare const arrayWithImported: Array<ExportedFromDts>;
