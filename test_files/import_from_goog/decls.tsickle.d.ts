// Matches ./closure_Module.js
declare module 'goog:closure.Module' {
  class X {}
  export default X;
}

// Matches ./closure_OtherModule.js
declare module 'goog:closure.OtherModule' {
  class SymA {}
  class SymB {}
  export {SymA, SymB};
}
