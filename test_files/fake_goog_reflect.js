/**
 * @fileoverview A simple fake version of goog.reflect, for testing compilation.
 */

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

var goog = goog || {};
goog.provide('goog.reflect');

/**
 * A fake goog.reflect.objectProperty
 *
 * @param {string} prop Name of the property
 * @param {!Object} object Instance of the object whose type will be used
 *     for renaming
 * @return {string} The renamed property.
 */
goog.reflect.objectProperty = function(prop, object) {
  return prop;
};
