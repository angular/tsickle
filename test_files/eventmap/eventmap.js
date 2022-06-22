/**
 *
 * @fileoverview
 * Generated from: test_files/eventmap/eventmap.ts
 * @suppress {checkTypes}
 *
 */
goog.module('test_files.eventmap.eventmap');
var module = module || { id: 'test_files/eventmap/eventmap.ts' };
goog.require('tslib');
document.body.addEventListener('wobble', (/**
 * @param {!WobbleEvent} we
 * @return {void}
 */
(we) => {
    console.log('wobble!');
}));
