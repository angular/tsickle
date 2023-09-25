/**
 * @fileoverview Example of a human-authored d.ts file that wants to control
 * its goog.module import name.  Normally in Clutz we generate 'declare module'
 * blocks and control the goog.module name there, but this d.ts is itself an
 * actual ES module.  This test is verifying that this pattern works.
 */

/** Export a symbol, just to show this is a module. */
export const foo = 3;

/**
 * This magic symbol controls the goog.module name that imports of this module
 * use.
 */
export const __clutz_actual_namespace: 'custom.module.name';
