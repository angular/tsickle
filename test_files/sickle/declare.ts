declare module DeclareTest {
  // This enum should not cause any extra sickle statements to be
  // emitted, because it is contained within a "declare" block.
  enum FileType {
    VALID = 1,
  }
}

module DeclareTestIncluded {/** @typedef {number} */

  // This enum should produce statements, as it's not a "declare".
  enum FileType {
    VALID = 1,
  }
/** @type {FileType} */
(<any>FileType).VALID =  1;

}
