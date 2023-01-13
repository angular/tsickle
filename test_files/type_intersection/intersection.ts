/**
 * @fileoverview Test that type alias declarations containing an intersection
 * of type literals does not lose property names in the externs. Regression
 * test for b/261049209.
 * @suppress {uselessCode}
 */

export {}

type A = {
  x: number
};

// Ensure that the properties foo, a, and b are mentioned in the externs
// file, even though the intersection types B and C are translated to ? by
// tsickle.
export declare type B = A & {foo: string};

export declare type C = A & ({a: number} | {
                          a: string;
                          b: any
                        });
