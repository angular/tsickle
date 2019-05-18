export {};

/**
 * Despite being declared in a module, the module is a .ts file, so it
 * should appear as a global in the externs.
 */
declare var declaredInPlainTS: number;
