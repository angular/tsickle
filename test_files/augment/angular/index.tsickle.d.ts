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
