/**
 * @fileoverview
 * @suppress {uselessCode}
 */

class UnrelatedClass {
  a = 1;
}

class MethodsReturnThis {
  b = 1;

  returnsThis() {
    return this;
  }

  explicitThis(): this {
    return this;
  }

  templateAndThis<T>(t: T): this {
    return this;
  }

  // Ensures that access to `this` is cast to the precise type.
  castsThisPropertyAccess(): this {
    this.b = 2;
    return this;
  }

  // Ensures that nested access to a differently scoped `this` is not cast.
  nestedDifferentThis(): this {
    function differentThis(this: UnrelatedClass) {
      this.a = 2;
    }
    class NestedClass {
      c = 3;

      method() {
        this.c = 4;
      }
    }
    return this;
  }

  // Ensures that arrow functions inherit the parent's `this` type.
  nestedArrowThis(): this {
    const sameThis = () => {
      this.b = 1;
    };
    sameThis();
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
