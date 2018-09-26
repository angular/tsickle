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
}

class SubclassReturnsThis extends MethodsReturnThis {
  returnsThis() {
    return super.returnsThis();
  }
}

export {};
