/** Used by implement_import.ts */
export interface Point {
  x: number;
  y: number;
}

/** Used by implement_import.ts */
export class User { shoeSize: number; }

function usePoint(p: Point): number {
  return p.x + p.y;
}

let p: Point = {x: 1, y: 1};
usePoint(p);
usePoint({x: 1, y: 1});

/*
TODO: this example crashes the compiler -- I've mailed the team about it.
interface Point3 extends Point {
  z: number;
}
let p3: Point3 = {x:1, y:1, z:1};
usePoint(p3);
*/

// Check some harder interface types.
interface TrickyInterface {
  [offset: number]: number;
  'foo': number;
  (x: number): /* yuck */
      number;
  'foobar'?: 'true'|'false';
  // Note: this should be type ?|undefined, which is different(!) than just {?}.
  optAny?: any|string;
  /**
   * @param a some string value
   * @return some number value
   * @override
   */
  hasSomeParamJsDoc: (a: string) => number;
}
enum TextureType {
  DEFAULT,
  // When using a standard RGBA-packed color image.
  RGBA_COLOR
}
/** @hidden */
export interface DataTypes {
  float32: Float32Array;
  int32: Int32Array;
  bool: Uint8Array;
}
/** @hidden */
export interface NDArrayData<T extends keyof DataTypes> {
  values?: DataTypes[T];
  texture?: WebGLTexture;
  /** [rows, columns] shape of the texture. */
  textureShapeRC?: [number, number];
  textureType?: TextureType;
  isDisposed?: boolean;
}
