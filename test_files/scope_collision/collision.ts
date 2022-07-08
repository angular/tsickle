/**
 * @fileoverview
 * TODO(b/195232797): remove the checkTypes suppression
 * @suppress {checkTypes,uselessCode}
 */

export {}

interface MyType {
  propA: string;
}

type MyTypeAlias = MyType;

(function() {
// TODO(b/195232797): Should emit MyTypeAlias
class MyType implements MyTypeAlias {
  propA: string = 'a';
  propB: string = 'b';
}

// TODO(b/195232797): Should emit MyTypeAlias
function test(a: MyTypeAlias, b: MyType): string {
  return a.propA + b.propB;
}

return test;
})();
