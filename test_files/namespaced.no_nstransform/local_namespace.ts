export {}

/** @someTag */
namespace unexported {
  export class Unexported {}
}

let x: unexported.Unexported;
