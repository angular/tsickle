/** @fileoverview Reproduces an error that caused incorrect Automatic Semicolon Insertion. */

const foo = () =>
    // this comment must not get inserted between the return and expression in ES5 (ASI).
    console.log('foo');

const bar = () =>
// Print "bar"
{
  console.log('bar');
};
