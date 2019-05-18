export function isBoolean(a: {}): a is string {
  return typeof a === 'string';
}

function isThenable<T>(obj: object): obj is PromiseLike<T> {
  return true;
}
