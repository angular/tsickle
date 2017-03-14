/**
 * @fileoverview Tests that a file overview comment is retained.
 * @modName {some_modname}
 * @mods {some.target}
 */

import X from 'goog:closure.FileOverview';
const tsickle_forward_declare_1 = goog.forwardDeclare('closure.FileOverview');
goog.require('closure.FileOverview'); // force type-only module to be loaded // from //some/path

let /** @type {(null|!tsickle_forward_declare_1)} */ x: X|null = null;
console.log(x);
