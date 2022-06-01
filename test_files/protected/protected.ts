/**
 * @fileoverview This test checks that we emit \@private/\@protected where
 * necessary.
 * @suppress {uselessCode}
 */

export {};

class Protected {
  private privateMember: string;
  protected protectedMember: string;
  private privateMethod() {}
  protected protectedMethod() {}

  constructor(
      private anotherPrivate: string,
      protected anotherProtected: string,
  ) {}
}

abstract class Abstract {
  protected abstract foo(): void;
}
