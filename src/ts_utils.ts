/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview This is to provide backward compatibility with TS 4.7 until we
 * finish cleanup. This is a copy of javascript/typescript/compiler/ts_utils.ts
 *
 * TODO(chinthoorie): remove this once we upgrade to TS 4.8.
 */

import * as ts from 'typescript';

// this util will be removed after the TS 4.8 upgrade
// tslint:disable:ban-module-namespace-object-escape
// tslint:disable:no-any

/** Returns node's decorators. */
export function getDecorators(node: ts.Node): readonly ts.Decorator[]|
    undefined {
  if ((ts as any).getDecorators) {
    return (ts as any).getDecorators(node);
  }
  return node.decorators;
}

/** Returns node's modifiers. */
export function getModifiers(node: ts.Node): readonly ts.Modifier[]|undefined {
  if ((ts as any).getModifiers) {
    return (ts as any).getModifiers(node);
  }
  return node.modifiers?.filter(ts.isModifier);
}

// tslint:enable:no-any
// tslint:enable:ban-module-namespace-object-escape
