
export class Class {}
/**
 * @record
 */
export function Interface() {}
/** @type {number} */
Interface.prototype.x;
/* TODO: handle strange member:
"quoted-bad-name": string;
*/

export interface Interface {
  x: number;
  "quoted-bad-name": string;
}
