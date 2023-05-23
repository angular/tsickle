/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview Path manipulation functions.
 * These are the functions exposed by nodejs in the 'path' module.
 *
 * But we actually use the TypeScript path-manipulation logic because:
 * 1) we want the exact same behaviors as TS;
 * 2) we don't depend on node's 'path' module when running under a browser
 * So we poke into their private API for these.
 */

import * as ts from 'typescript';

declare module 'typescript' {
  function isRootedDiskPath(path: string): boolean;
  function combinePaths(...paths: string[]): string;
  function getDirectoryPath(path: string): string;
  function convertToRelativePath(
      absoluteOrRelativePath: string, basePath: string,
      getCanonicalFileName: (path: string) => string): string;
  function resolvePath(path: string, ...paths: Array<string|undefined>): string;
}

export function isAbsolute(path: string): boolean {
  return ts.isRootedDiskPath(path);
}

export function join(p1: string, p2: string): string {
  return ts.combinePaths(p1, p2);
}

export function dirname(path: string): string {
  return ts.getDirectoryPath(path);
}

export function relative(base: string, rel: string): string {
  return ts.convertToRelativePath(rel, base, p => p);
}

export function normalize(path: string): string {
  return ts.resolvePath(path);
}

/** Wrapper around ts.resolvePath. */
export function resolve(path: string, ...paths: string[]): string {
  return ts.resolvePath(path, ...paths);
}
