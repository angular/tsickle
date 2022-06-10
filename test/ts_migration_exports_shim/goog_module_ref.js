/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

goog.module('goog.module.ref');

const DefaultExportClass = goog.require('migrated.module.default.value');
const DefaultExportType = goog.require('migrated.module.default.type');
const notConst = goog.require('migrated.module.default.const');
const {NamedExportClassRenamed, RenamedExportedType, delete: notDelete} = goog.require('migrated.module.named');
const {someConstant, delete: alsoNotDelete} = goog.require('migrated.module.named_shorthand');

// Check that passing default export types works.
DefaultExportClass.use(new DefaultExportClass());
// Check that default export types are known types.
let /** !DefaultExportClass */ a;

// Check that passing named export types works.
NamedExportClassRenamed.use(new NamedExportClassRenamed());
// Check that named export types are known types.
let /** !NamedExportClassRenamed */ b;

// Check that default export types are known types.
/** @param {!DefaultExportType} x */
function testDefaultExportType(x) {
  x.shouldBeANumber = 42;
  x.someMethod(x);
}
let /** !DefaultExportType */ c = {
  shouldBeANumber: 42,
  /** @param {!DefaultExportType} x */
  someMethod: (x) => {},
};
testDefaultExportType(c);

/** @param {!RenamedExportedType} x */
function testRenamedExportedType(x) {
  x.shouldBeANumber = 42;
  x.someMethod(x);
}
let /** !RenamedExportedType */ d = {
  shouldBeANumber: 42,
  /** @param {!DefaultExportType} x */
  someMethod: (x) => {},
};
testRenamedExportedType(d);

const /** number */ n1 = someConstant;

const /** string */ s1 = notDelete;
const /** string */ s2 = alsoNotDelete;
const /** string */ s3 = notConst;

// Reexport these imports so we can confirm the types are identical downstream.
exports = {
  DefaultExportClassFromJs: DefaultExportClass,
  NamedExportClassFromJs: NamedExportClassRenamed,
  RenamedExportedTypeFromJs: RenamedExportedType,
  DefaultExportTypeFromJs: DefaultExportType,
  deleteFromJs: notDelete,
  someConstantFromJs: someConstant,
};
