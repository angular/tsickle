/** @typedef {number} */
enum FooEnum {XYZ, PI = 3.14159}
/** @type {FooEnum} */
(<any>FooEnum).XYZ = 0;
/** @type {FooEnum} */
(<any>FooEnum).PI =  3.14159;
