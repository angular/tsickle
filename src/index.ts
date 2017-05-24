/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {convertDecorators} from './decorator-annotator';
export {processES5} from './es5processor';
export {FileMap, ModulesManifest} from './modules_manifest';
export {EmitResult, EmitTransformers, emitWithTsickle, TransformerHost, TransformerOptions} from './transformer';
export {getGeneratedExterns} from './tsickle';
export {Options, Pass, TsickleCompilerHost, TsickleHost} from './tsickle_compiler_host';
