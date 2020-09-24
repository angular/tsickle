/**
 * @fileoverview added by tsickle
 * Generated from: test_files/jsx.no_externs/jsx.tsx
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.jsx.no_externs.jsx.tsx');
var module = module || { id: 'test_files/jsx.no_externs/jsx.tsx' };
goog.require('tslib');
/** @type {!JSX.Element} */
let simple = React.createElement("div", null);
/** @type {string} */
let hello = 'hello';
/** @type {!JSX.Element} */
let helloDiv = React.createElement("div", null,
    hello,
    "hello, world",
    React.createElement(Component, null));
React.render(helloDiv, (/** @type {!HTMLElement} */ (document.body)));
