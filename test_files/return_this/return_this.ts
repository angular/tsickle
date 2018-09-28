class MethodsReturnThis {
  returnsThis() {
    return this;
  }

  explicitThis(): this {
    return this;
  }

  templateAndThis<T>(t: T): this {
    return this;
  }

  overloadedThis(a: number): this;
  overloadedThis<U extends string>(u: U): this;
  overloadedThis<T extends string>(u: T): this;
  overloadedThis<T>(t: T): this {
    return this;
  }
}

class SubclassReturnsThis extends MethodsReturnThis {
  returnsThis() {
    return super.returnsThis();
  }
}

export {};
