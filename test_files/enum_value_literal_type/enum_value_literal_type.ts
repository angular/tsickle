// Note: if you only have one value in the enum, then the type of "x" below
// is just ExportedEnum, regardless of the annotation.  This might be a bug
// in TypeScript but this test is just trying to verify the behavior of
// exporting an enum's value, not that.

export enum ExportedEnum {
  VALUE = 0,
  OTHERVALUE,
}
export const x: ExportedEnum.VALUE = ExportedEnum.VALUE;
