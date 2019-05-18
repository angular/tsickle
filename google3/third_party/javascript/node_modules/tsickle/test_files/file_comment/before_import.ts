/**
 * @fileoverview fileoverview comment before import. transformer_util.ts has
 * special logic to handle comments before import/require() calls. This file
 * tests the regular import case.
 */

import {y} from './comment_before_var';

console.log(y);
