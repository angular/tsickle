/**
 * @fileoverview A short test that ensures that string manipulation types (such
 * as `Uncapitalize`) are converted to a generic `string` type.
 */

export {};

type StringManipulation<Name extends string> = Uncapitalize<Lowercase<Name>>;

const T: StringManipulation<'something'> = 'something';
console.log(T);
