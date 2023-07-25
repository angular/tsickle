/**
 * @fileoverview Test transpilation of namespaces merging with classes or
 * functions.
 * @suppress {checkTypes,constantProperty}
 */

// TODO(#132): 'export namespace' currently don't emit properly.
// This workaround at least makes them compile.
// It's useful to keep at least one instance of this workaround
// in the test suite to ensure it also continues working.
// @ts-ignore
exports = {};

export class Foo {}

export namespace Foo {
  export class Nested {}
}


export function bar() {}

export namespace bar {
  export class Nested {}
}

class Baz {}

namespace Baz {
  export class Nested {}
}

export {Baz};
