/**
 * @fileoverview
 * @suppress {checkTypes}
 */

import * as ng from './angular/index';

const fakeScope: ng.Scope = {
  name: ng.version
};
const usingAugment: ng.sub.AugmentSubType = {
  prop: fakeScope.name
};
