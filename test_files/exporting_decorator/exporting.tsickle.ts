
/**
 * \@ExportDecoratedItems
 * @return {function(?): void}
 */
function exportingClassDecorator() {
  return function(target: any) {}
}
/**
 * @return {function(?): void}
 */
function nonExportingClassDecorator() {
  return function(target: any) {}
}
/**
 * \@ExportDecoratedItems
 * @return {function(?, (string|symbol)): void}
 */
function exportingFieldDecorator() {
  return function(target: any, name: string|symbol) {}
}
/**
 * @return {function(?, (string|symbol)): void}
 */
function nonExportingFieldDecorator() {
  return function(target: any, name: string|symbol) {}
}
@exportingClassDecorator()
class ExportedClass {

  @exportingFieldDecorator()
  exportMe: boolean;

  @nonExportingFieldDecorator()
  doNotExportMe: number;
}

function ExportedClass_tsickle_Closure_declarations() {
/** @type {boolean} */
ExportedClass.prototype.exportMe;
/** @type {number} */
ExportedClass.prototype.doNotExportMe;
}

@nonExportingClassDecorator()
class NonExportedClass {
/**
 * @return {boolean}
 */
@exportingFieldDecorator()
  exportThisOneToo() {
    return false;  
  }
/**
 * @return {number}
 */
@nonExportingFieldDecorator()
  doNotExportThisOneEither() {
    return 42;
  }
/**
 * @return {number}
 */
@exportingFieldDecorator()
  get exportThisGetter() {
    return 42;
  }
/**
 * @param {number} x
 * @return {void}
 */
@exportingFieldDecorator()
  set exportThisSetter(x: number) {
    console.log(`I don't really care about ${x}.`);
  }
}
