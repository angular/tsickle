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

import {DefaultExportClassFromJs, NamedExportClassFromJs} from 'goog:goog.module.ref';
import DefaultExportClass from 'goog:migrated.module.default';
import {NamedExportClassRenamed} from 'goog:migrated.module.named';

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
