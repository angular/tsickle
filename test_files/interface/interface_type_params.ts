/**
 * @fileoverview
 * @suppress {uselessCode}
 */

interface UpperBound {
  x: number;
}

interface WithTypeParam<T extends UpperBound, U> {
  tea: T;
  you: U;
}
