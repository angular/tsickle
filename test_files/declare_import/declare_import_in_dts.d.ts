/**
 * @fileoverview Tests that imports in .d.ts resolve to the correct result names. See externs.ts
 * addImportAliases.
 *
 * The code below tests mixing symbols from .d.ts and .ts files, to make sure type references are
 * uniformly generated.
 */

import LocalDefaultClosureClassName from 'goog:imported.closure.default.Class';
import {Class as LocalNamedClosureClassName} from 'goog:imported.closure.named';

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
export declare class ExtendsLocalDefaultClosureClassName extends LocalDefaultClosureClassName {}
export declare class ExtendsLocalNamedClosureClassName extends LocalNamedClosureClassName {}
export declare class ExtendsImportEquals extends importEquals.ImportEqualsExportedClass {}
export declare const arrayWithImported: Array<ExportedFromDts>;
