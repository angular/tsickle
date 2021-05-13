/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Check that the original TS types, tsmes-clutzed types, and
 * reexported tsmes-clutzed types are all interoperable. There should only be 2
 * classes here, but there are many ways to import them that must behave the
 * same.
 */

import {DefaultExportClassFromJs, DefaultExportTypeFromJs, NamedExportClassFromJs, RenamedExportedTypeFromJs} from 'goog:goog.module.ref';
import DefaultExportType from 'goog:migrated.module.default.type';
import DefaultExportClass from 'goog:migrated.module.default.value';
import {NamedExportClassRenamed, RenamedExportedType} from 'goog:migrated.module.named';

// tslint:disable

DefaultExportClass.use(new DefaultExportClass());
let a: DefaultExportClass;
// @ts-expect-error
DefaultExportClass.use(0);
// @ts-expect-error
DefaultExportClass.notARealProperty;

NamedExportClassRenamed.use(new NamedExportClassRenamed());
let b: NamedExportClassRenamed;
// @ts-expect-error
NamedExportClassRenamed.use(0);
// @ts-expect-error
NamedExportClassRenamed.notARealProperty;

DefaultExportClassFromJs.use(new DefaultExportClassFromJs());
let c: DefaultExportClassFromJs;
// @ts-expect-error
DefaultExportClassFromJs.use(0);
// @ts-expect-error
DefaultExportClassFromJs.notARealProperty;

NamedExportClassFromJs.use(new NamedExportClassFromJs());
let d: NamedExportClassFromJs;
// @ts-expect-error
NamedExportClassFromJs.use(0);
// @ts-expect-error
NamedExportClassFromJs.notARealProperty;

DefaultExportClass.use(new DefaultExportClassFromJs());
DefaultExportClassFromJs.use(new DefaultExportClass());

NamedExportClassRenamed.use(new NamedExportClassFromJs());
NamedExportClassFromJs.use(new NamedExportClassRenamed());

function testDefaultExportType(x: DefaultExportType) {
  const notOfTheCorrectType = 'foo';
  // @ts-expect-error
  x.shouldBeANumber = 'foo';
  x.shouldBeANumber = 42;
  // @ts-expect-error
  x.someMethod(notOfTheCorrectType);
  x.someMethod(x);
}
let f: DefaultExportType = {
  shouldBeANumber: 42,
  someMethod: (x: DefaultExportType) => {},
};
// @ts-expect-error
let h: DefaultExportType = {
  shouldBeANumber: 42,
};
testDefaultExportType(f);

function testDefaultExportTypeFromJs(x: DefaultExportTypeFromJs) {
  const notOfTheCorrectType = 'foo';
  // @ts-expect-error
  x.shouldBeANumber = 'foo';
  x.shouldBeANumber = 42;
  // @ts-expect-error
  x.someMethod(notOfTheCorrectType);
  x.someMethod(x);
}
let j: DefaultExportTypeFromJs = {
  shouldBeANumber: 42,
  someMethod: (x: DefaultExportTypeFromJs) => {},
};
// @ts-expect-error
let k: DefaultExportType = {
  shouldBeANumber: 42,
};
testDefaultExportTypeFromJs(j);

f.someMethod(f);
f.someMethod(j);
j.someMethod(f);
j.someMethod(j);

function testRenamedExportedType(x: RenamedExportedType) {
  const notOfTheCorrectType = 'foo';
  // @ts-expect-error
  x.shouldBeANumber = 'foo';
  x.shouldBeANumber = 42;
  // @ts-expect-error
  x.someMethod(notOfTheCorrectType);
  x.someMethod(x);
}
let n: RenamedExportedType = {
  shouldBeANumber: 42,
  someMethod: (x: RenamedExportedType) => {},
};
// @ts-expect-error
let o: RenamedExportedType = {
  shouldBeANumber: 42,
};
testRenamedExportedType(n);

function testRenamedExportedTypeFromJs(x: RenamedExportedTypeFromJs) {
  const notOfTheCorrectType = 'foo';
  // @ts-expect-error
  x.shouldBeANumber = 'foo';
  x.shouldBeANumber = 42;
  // @ts-expect-error
  x.someMethod(notOfTheCorrectType);
  x.someMethod(x);
}
let r: RenamedExportedTypeFromJs = {
  shouldBeANumber: 42,
  someMethod: (x: RenamedExportedType) => {},
};
// @ts-expect-error
let s: RenamedExportedTypeFromJs = {
  shouldBeANumber: 42,
};
testRenamedExportedTypeFromJs(r);

n.someMethod(n);
n.someMethod(r);
r.someMethod(r);
r.someMethod(n);
