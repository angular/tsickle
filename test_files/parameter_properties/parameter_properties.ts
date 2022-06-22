/**
 * @fileoverview
 * @suppress {uselessCode}
 */

class ParamProps {
  // The @export below should not show up in the output ctor.
  constructor(
      /** @export */ public publicExportedP: string,
      /* foo */ public publicP: string,
      protected protectedP: string,
      private privateP: string,
      readonly readonlyP: string,
      public readonly publicReadonlyP: string,
  ) {}
}
