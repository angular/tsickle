/** An example export to be re-exported. */
export type DefaultTypeLiteral = string;

goog.tsMigrationExportsShim(
    'project.MyDefaultTypeLiteral', {} as DefaultTypeLiteral);
