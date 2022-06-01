/**
 * @fileoverview
 * @suppress {uselessCode}
 */

export {}

/** @ExportDecoratedItems */
function exportingDecorator() {
  return function(target: any, name: string|symbol) {}
}

function nonExportingDecorator() {
  return function(target: any, name: string|symbol) {}
}

class MyClass {

  @exportingDecorator() exportMe: boolean;

  @nonExportingDecorator()
  doNotExportMe: number;

  @exportingDecorator() exportThisOneToo() {
    return false;
  }

  @nonExportingDecorator() doNotExportThisOneEither() {
    return 42;
  }

  @exportingDecorator()
  get exportThisGetter() {
    return 42;
  }

  @exportingDecorator()
  set exportThisSetter(x: number) {
    console.log(`I don't really care about ${x}.`);
  }

  @nonExportingDecorator()
  get doNotExportThisGetter() {
    return 42;
  }

  @nonExportingDecorator()
  set doNotExportThisSetter(x: number) {
    console.log(`I don't really care about ${x}.`);
  }
}
