/**
 * @fileoverview
 * @suppress {checkTypes,uselessCode}
 */

import {ConstEnum} from './enum';

export interface EnumUsingIf {
  field: ConstEnum;
}

const fieldUsingConstEnum = ConstEnum.EMITTED_ENUM_VALUE;
