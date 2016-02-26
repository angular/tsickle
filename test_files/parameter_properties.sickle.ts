class ParamProps {
  // The @export below should not show up in the output ctor.
  constructor(
public bar: string,
public bar2: string) {}

  static _sickle_typeAnnotationsHelper() {
 /** @export
@type { string} */
    ParamProps.prototype.bar;
 /** @type { string} */
    ParamProps.prototype.bar2;
  }

}
