class ParamProps {
  // The @export below should not show up in the output ctor.
  constructor(
public bar: string,
public bar2: string) {

// Sickle: begin stub declarations.

 /** @export
@type { string} */
this.bar;
 /** @type { string} */
this.bar2;
// Sickle: end stub declarations.
}
}
