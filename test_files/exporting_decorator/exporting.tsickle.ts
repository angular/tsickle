/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */



/**
 * \@ExportDecoratedItems
 * @return {function(?, (string|symbol)): void}
 */
function exportingDecorator() {
  return function(target: any, name: string|symbol) {}
}
/**
 * @return {function(?, (string|symbol)): void}
 */
function nonExportingDecorator() {
  return function(target: any, name: string|symbol) {}
}
class MyClass {
/**
 * @export
 */
@exportingDecorator()
  exportMe: boolean;

  @nonExportingDecorator()
  doNotExportMe: number;
/**
 * @export
 * @return {boolean}
 */
@exportingDecorator()
  exportThisOneToo() {
    return false;  
  }
/**
 * @return {number}
 */
@nonExportingDecorator()
  doNotExportThisOneEither() {
    return 42;
  }
/**
 * @export
 * @return {number}
 */
@exportingDecorator()
  get exportThisGetter() {
    return 42;
  }
/**
 * @export
 * @param {number} x
 * @return {void}
 */
@exportingDecorator()
  set exportThisSetter(x: number) {
    console.log(`I don't really care about ${x}.`);
  }
/**
 * @return {number}
 */
@nonExportingDecorator()
  get doNotExportThisGetter() {
    return 42;
  }
/**
 * @param {number} x
 * @return {void}
 */
@nonExportingDecorator()
  set doNotExportThisSetter(x: number) {
    console.log(`I don't really care about ${x}.`);
  }
}

function MyClass_tsickle_Closure_declarations() {
/** @type {boolean} */
MyClass.prototype.exportMe;
/** @type {number} */
MyClass.prototype.doNotExportMe;
}

