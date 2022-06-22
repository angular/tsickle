/**
 * @fileoverview Tests the generation of private field accessors from Tsickle.
 * They do not generate any externs, as they do not exist on the class
 * themselves when downleveled by TypeScript.
 * @suppress {checkTypes,uselessCode}
 */

export {};

class ContainsPrivateField {
  #someField: string;

  constructor(arg: string) {
    this.#someField = arg;
  }

  setSomeField(value: string) {
    this.#someField = value;
  }

  getSomeField() {
    return this.#someField;
  }
}
