
/**
 * @param {?} arg1
 * @return {?}
 */
function func(arg1: string): number[] {
  return [3];
}

class Foo {
  field: string;
/**
 * @param {?} ctorArg
 */
constructor(private ctorArg: string) {
    this.field = 'hello';
  }

  static _sickle_typeAnnotationsHelper() {
 /** @type {?} */
    Foo.prototype.field;
 /** @type {?} */
    Foo.prototype.ctorArg;
  }

}
