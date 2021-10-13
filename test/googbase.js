/**
 * @fileoverview Mocks missing goog functions for e2e_closure_test.ts. Closure
 * Compiler complains about a missing goog.provide without these definitions.
 */

/** @const */
var goog = goog || {};
goog.provide = function(ns) {};
