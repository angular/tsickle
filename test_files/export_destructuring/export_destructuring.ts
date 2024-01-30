
function signal(n: number) {
  return [n, n + 1];
}
function objectLiteral(n: number) {
  return {c: n, d: n + 1};
}

export const [a, b] = signal(0);

export const {c, d} = objectLiteral(0);
