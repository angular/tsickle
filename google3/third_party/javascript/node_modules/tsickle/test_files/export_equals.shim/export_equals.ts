import * as someNamespace from './namespace';

// Important: this must not assign into module.exports, but rather directly into
// exports, as expected by goog.module.
export = someNamespace;
