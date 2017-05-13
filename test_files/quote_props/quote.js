goog.module('test_files.quote_props.quote');var module = module || {id: 'test_files/quote_props/quote.js'};/**
 * @record
 */
function Quoted() { }
let /** @type {!Quoted} */ quoted = {};
console.log(quoted['hello']);
quoted['hello'] = 1;
quoted['hello'] = 1;
/**
 * @record
 * @extends {Quoted}
 */
function QuotedMixed() { }
/** @type {number} */
QuotedMixed.prototype.foo;
// TODO(martinprobst): should 'foo: 1' below be quoted?
let /** @type {!QuotedMixed} */ quotedMixed = { foo: 1 };
console.log(quotedMixed['foo']);
// TODO(martinprobst): should this access to a declared property be quoted?
quotedMixed['foo'] = 1;
// TODO(martinprobst): should this access to a declared property be un-quoted?
quotedMixed['foo'] = 1;
