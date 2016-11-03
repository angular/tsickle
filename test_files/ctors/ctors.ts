let x = Document;
class X {
  constructor(private a: number) {}
}
let y: {new (a: number): X} = X;
