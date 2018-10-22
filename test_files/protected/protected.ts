/** This test checks that we emit \@private/\@protected where necessary. */

export {};

class Protected {
  private privateMember: string;
  protected protectedMember: string;

  constructor(
      private anotherPrivate: string,
      protected anotherProtected: string,
  ) {}
}
