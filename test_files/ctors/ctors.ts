/**
 * @fileoverview
 * @suppress {uselessCode}
 */

let x = Document;
class X {
  constructor(private a: number) {}
}
let y: {new (a: number): X} = X;


class OverloadedCtor {
  constructor(a: number);
  constructor(a: string);
  constructor(private a: number|string) {}
}
