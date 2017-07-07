/**
 * This file is a simplified representation of what angular's d.ts file
 * looks like.  It's not really part of the test, it's what the test is
 * testing against.
 */

export = angular;

declare var angular: string;

declare namespace angular {
  interface IFooBar {
    field: string;
  }
  namespace sub {
    type SubType = string;
  }
}
