class Comments {
  /** @export */
  export1: string;
  // Note: the below @export doesn't make it into the output because it
  // it isn't in a JSDoc comment.
  /// @export
  export2: string;
  /* non js-doc comment */
  nodoc1: number;
  // non js-doc comment
  nodoc2: number;
  /// non js-doc comment
  nodoc3: number;
  /** inline jsdoc comment without type annotation */
  jsdoc1: number;
  /**
   * multi-line jsdoc comment without
   * type annotation.
   */
  jsdoc2: number;
_sickle_typeAnnotationsHelper() {
 /** @export
@type { string} */
this.export1;
 /** @type { string} */
this.export2;
 /** @type { number} */
this.nodoc1;
 /** @type { number} */
this.nodoc2;
 /** @type { number} */
this.nodoc3;
 /** inline jsdoc comment without type annotation
@type { number} */
this.jsdoc1;
 /** * multi-line jsdoc comment without
   * type annotation.
@type { number} */
this.jsdoc2;
}

}
