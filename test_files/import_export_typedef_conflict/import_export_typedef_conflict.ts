/**
 * @fileoverview reproduces a problem where importing a symbol that's also a typedef in the local
 * scope would cause a duplicate exports assignment, once for the imported symbol and once for the
 * exported typedef.
 */

import * as ConflictingName from './exporter';

export type ConflictingName = number;

export const myVariable: ConflictingName = ConflictingName.x;
