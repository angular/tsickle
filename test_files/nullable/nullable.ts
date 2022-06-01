/**
 * @fileoverview
 * @suppress {checkTypes,uselessCode}
 */

class Primitives {
  nullable: string|null;
  undefinable: number|undefined;
  nullableUndefinable: string|null|undefined;
  optional?: string;
}

class NonPrimitive {}

class NonPrimitives {
  nonNull: NonPrimitive;
  nullable: NonPrimitive|null;
  undefinable: NonPrimitive|undefined;
  nullableUndefinable: NonPrimitive|null|undefined;
  optional?: NonPrimitive;
}

function takesNonNullable(val: string|number) {}

let x: {field: string|null|number} = {field: null};
takesNonNullable(x.field!);
takesNonNullable(`${x.field!}`);
let ctx: any;
takesNonNullable(`org/${ctx.getTargetOrganization()!.key}/admin/folders`);
