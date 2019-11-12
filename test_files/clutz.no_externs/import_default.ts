/**
 * @fileoverview Reproduces a problem where a renamed Clutz default export ({default as X}) would
 * produce type annotations including an indirection to the aliased symbol.
 */

import DefaultExportNamed from 'goog:default_export';
// This import renaming style triggered the type naming issue, as Clutz did not recognize this as
// a default import.
import {default as RenamedDefaultExport} from 'goog:default_export';

const usingType: DefaultExportNamed|null = null;
// The symbol below was previously named as tsickle_default_export_1.AliasedDefaultExport. It must
// be emitted as just tsickle_default_export_1.
const usingType2: RenamedDefaultExport|null = null;
