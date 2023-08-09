/**
 *
 * @fileoverview Test transpilation of namespaces merging with classes or
 * functions.
 * Generated from: test_files/namespaced.no_nstransform/merged_namespace.ts
 * @suppress {checkTypes,constantProperty}
 *
 */
goog.module('test_files.namespaced.no_nstransform.merged_namespace');
var module = module || { id: 'test_files/namespaced.no_nstransform/merged_namespace.ts' };
goog.require('tslib');
// TODO(#132): 'export namespace' currently don't emit properly.
// This workaround at least makes them compile.
// It's useful to keep at least one instance of this workaround
// in the test suite to ensure it also continues working.
// @ts-ignore
exports = {};
class Foo {
}
exports.Foo = Foo;
(function (Foo) {
    class Nested {
    }
    Foo.Nested = Nested;
})(Foo || (Foo = {}));
/**
 * @return {void}
 */
function bar() { }
exports.bar = bar;
(function (bar) {
    class Nested {
    }
    bar.Nested = Nested;
})(bar || (bar = {}));
class Baz {
}
exports.Baz = Baz;
(function (Baz) {
    class Nested {
    }
    Baz.Nested = Nested;
})(Baz || (Baz = {}));
