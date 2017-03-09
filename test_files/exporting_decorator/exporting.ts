/** @ExportDecoratedItems */
function exportingClassDecorator() {
  return function(target: any) {}
}

function nonExportingClassDecorator() {
  return function(target: any) {}
}

/** @ExportDecoratedItems */
function exportingFieldDecorator() {
  return function(target: any, name: string|symbol) {}
}

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

@nonExportingClassDecorator()
class NonExportedClass {  
  @exportingFieldDecorator()
  exportThisOneToo() {
    return false;  
  }

  @nonExportingFieldDecorator()
  doNotExportThisOneEither() {
    return 42;
  }

  @exportingFieldDecorator()
  get exportThisGetter() {
    return 42;
  }

  @exportingFieldDecorator()
  set exportThisSetter(x: number) {
    console.log(`I don't really care about ${x}.`);
  }
}
