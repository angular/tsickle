/**
 * @fileoverview typeof Promise actually resolves to "PromiseConstructor" in
 * TypeScript, which is a type that doesn't exist in Closure's type world. This
 * code passes the e2e test because closure_externs.js declares
 * PromiseConstructor.
 * @suppress {checkTypes}
 */

function f(promiseCtor?: typeof Promise): Promise<void> {
  return promiseCtor ? new promiseCtor((res, rej) => res()) : Promise.resolve();
}
