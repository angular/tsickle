/**
 * @fileoverview Tests that multiple implemented interfaces in a .d.ts file do
 * not get merged, but produce multiple implements tags.
 */

export declare interface MyInterface {
  a: string;
}

export declare interface MyOtherInterface {
  b: string;
}

export declare class InterfaceMultipleImpl implements MyInterface,
                                                      MyOtherInterface {
  a: string;
  b: string;
  constructor();
}
