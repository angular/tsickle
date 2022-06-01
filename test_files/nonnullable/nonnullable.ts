/**
 * @fileoverview TSickle generally does not support parameterized type aliases,
 * because JSCompiler does not support them either, and emits `?`. However
 * TSickle special cases `NonNullable<A>` to emit just `A`, so that the compiler
 * does not back off optimizations for properties accessed on the `?` type. The
 * main drawback is that to JS code the return type of this function still
 * appears to contain null or undefined. This causes some inconvenience, but
 * on balance is better than the optimization backoff and loss of type safety
 * caused by `?`.
 * @suppress {checkTypes}
 */
function getOrDefault<A>(value: A|null, def: A): NonNullable<A> {
  return (value || def) as NonNullable<A>;
}

function getMsg(): string {
  const maybeNull: string|null = Math.random() > 0.5 ? 'hello' : null;
  return getOrDefault(maybeNull, 'goodbye');
}

console.log(getMsg());
