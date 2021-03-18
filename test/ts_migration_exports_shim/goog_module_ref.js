/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

goog.module('goog.module.ref');

const DefaultExportClass = goog.require('migrated.module.default');
const {NamedExportClassRenamed} = goog.require('migrated.module.named');

// Check that passing default export types works.
DefaultExportClass.use(new DefaultExportClass());
// Check that default export types are known types.
let /** !DefaultExportClass */ a;

// Check that passing named export types works.
NamedExportClassRenamed.use(new NamedExportClassRenamed());
// Check that named export types are known types.
let /** !NamedExportClassRenamed */ b;

// Reexport these imports so we can confirm the types are identical downstream.
exports = {
  DefaultExportClassFromJs: DefaultExportClass,
  NamedExportClassFromJs: NamedExportClassRenamed,
};
