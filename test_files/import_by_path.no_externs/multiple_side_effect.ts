/**
 * @fileoverview Imports a module with conflicting provides, but with a
 * side-effect import. tsickle only reports an error when code imports a symbol
 * from a module with conflicting symbol exports, but not for a side effect
 * import.
 * @suppress {checkTypes}
 */

// This import produces a require for any of the provides defined in the given
// file. This has the intended effect: the file will be required and thus
// loaded. It does not matter which provide is required.
import 'google3/path/to/multiple_provides/conflicting';
