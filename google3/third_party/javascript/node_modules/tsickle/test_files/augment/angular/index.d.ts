export = angular;
export as namespace angular;

declare var angular: angular.IAngularStatic;

declare namespace angular {
  interface Scope {
    name: string;
  }
  namespace sub {
    type SubType = string;
  }
  interface IAngularStatic {
    copy(a: string): string;
    version: string;
  }
}
