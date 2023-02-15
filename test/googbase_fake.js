/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview Mocks missing goog functions for e2e_closure_test.ts. Closure
 * Compiler complains about a missing goog.provide without these definitions.
 */

/** @const */
var goog = goog || {};
goog.provide = function(ns) {};
goog.require = function(ns) {};
goog.requireType = function(ns) {};
