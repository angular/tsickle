/**
 * @fileoverview Declares a type alias as default export. This allows testing that the appropriate
 * type reference is created (no .default property).
 */

import {X} from './type_alias_declare';

export class Z {}

type DefaultExport = X|Z;
export default DefaultExport;
