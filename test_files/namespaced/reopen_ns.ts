/**
 * @fileoverview
 * @suppress {checkTypes,constantProperty}
 */

// TODO(#132): 'export namespace' currently don't emit properly.
// This workaround at least makes them compile.
// It's useful to keep at least one instance of this workaround
// in the test suite to ensure it also continues working.
// @ts-ignore
exports = {};

export namespace ns {
  export let x = 0;
}

export namespace ns {
  export let y = 0;
}

// this implicitly re-emits `ns = exports.ns || (exports.ns = {}));`, so it is
// in a way reopening ns, which can cause issues with Closure unless the right
// suppressions are present.
export namespace ns.bar {
  export let y = 0;
}
