/**
 * @fileoverview getOrDefault removes the |null branch from its input. In
 * TypeScript, this works, but in Closure, generics like T are always nullable,
 * and there's no syntax to specify a non-nullable generic. Thus, in Closure,
 * `getOrDefault(maybeNull, 'goodbye')` ends up still being string|null.
 * @suppress {checkTypes}
 */
function getOrDefault<T>(value: T|null, def: T) {
  return value || def;
}

function getMsg(): string {
  const maybeNull: string|null = Math.random() > 0.5 ? 'hello' : null;
  // The value below is inferred as string|null, which would normally cause
  // Closure Compiler to complain about an inconsistent nullable return type.
  // However the @suppress {checkTypes} inserted by tsickle at the top will
  // supprress that error.
  return getOrDefault(maybeNull, 'goodbye');
}

console.log(getMsg());
