/**
 * @fileoverview
 * @suppress {uselessCode}
 */

interface ParentInterface {
  x: number;
}

interface SubType extends ParentInterface {
  y: number;
}

interface SubMulti extends ParentInterface, SubType {
  z: number;
}
