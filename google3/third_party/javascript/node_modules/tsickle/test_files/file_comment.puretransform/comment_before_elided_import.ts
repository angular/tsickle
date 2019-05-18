/**
 * @fileoverview This is a comment before an import, where the import will be elided but the comment
 * must be kept.
 */

import * as otherMod from './comment_before_class';

const x: otherMod.Clazz|null = null;
console.log(x);
