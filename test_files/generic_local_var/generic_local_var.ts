
class Container<T> {
  constructor(private tField: T) {}
  method<U>(u: U) {
    const myT: T = this.tField;
    // Closure Compiler's Old Type Inference does not support using generic
    // method parameters as local symbols, so myU must be emitted as ?.
    const myU: U = u;
    console.log(myT, myU);
  }
}
