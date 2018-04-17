/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.jsx.jsx.tsx');
var module = module || { id: 'test_files/jsx/jsx.tsx' };
let /** @type {!JSX.Element} */ simple = React.createElement("div", null);
let /** @type {string} */ hello = 'hello';
let /** @type {!JSX.Element} */ helloDiv = React.createElement("div", null,
    hello,
    "hello, world",
    React.createElement(Component, null));
React.render(helloDiv, /** @type {!HTMLElement} */ ((document.body)));
