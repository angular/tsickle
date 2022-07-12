"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAstPrintingTransform = void 0;
const ts = require("typescript");
/**
 * Creates a transformer that captures the state of the AST as pretty printed
 * TypeScript in the provided 'files' map.
 */
function createAstPrintingTransform(files) {
    return (context) => {
        return (sf) => {
            files.set(sf.fileName, ts.createPrinter().printFile(sf));
            return sf;
        };
    };
}
exports.createAstPrintingTransform = createAstPrintingTransform;
//# sourceMappingURL=ast_printing_transform.js.map