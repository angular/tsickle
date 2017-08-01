/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {expect} from 'chai';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as ts from 'typescript';

import * as cliSupport from '../src/cli_support';
import * as es5processor from '../src/es5processor';
import * as tsickle from '../src/tsickle';
import {normalizeLineEndings, toArray} from '../src/util';

/** The TypeScript compiler options used by the test suite. */
export const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2015,
  skipDefaultLibCheck: true,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  noEmitHelpers: true,
  module: ts.ModuleKind.CommonJS,
  jsx: ts.JsxEmit.React,
  // Disable searching for @types typings. This prevents TS from looking
  // around for a node_modules directory.
  types: [],
  // Flags below are needed to make sure source paths are correctly set on write calls.
  rootDir: path.resolve(process.cwd()),
  outDir: '.',
  strictNullChecks: true,
  noImplicitUseStrict: true,
};

const {cachedLibPath, cachedLib} = (() => {
  const host = ts.createCompilerHost(compilerOptions);
  const fn = host.getDefaultLibFileName(compilerOptions);
  const p = ts.getDefaultLibFilePath(compilerOptions);
  return {
    // Normalize path to fix mixed/wrong directory separators on Windows.
    cachedLibPath: path.normalize(p),
    cachedLib: host.getSourceFile(fn, ts.ScriptTarget.ES2015)
  };
})();

/** Creates a ts.Program from a set of input files. */
export function createProgram(
    sources: Map<string, string>,
    tsCompilerOptions: ts.CompilerOptions = compilerOptions): ts.Program {
  return createProgramAndHost(sources, tsCompilerOptions).program;
}

export function createProgramAndHost(
    sources: Map<string, string>, tsCompilerOptions: ts.CompilerOptions = compilerOptions):
    {host: ts.CompilerHost, program: ts.Program} {
  const host = ts.createCompilerHost(tsCompilerOptions);

  host.getSourceFile = (fileName: string, languageVersion: ts.ScriptTarget,
                        onError?: (msg: string) => void): ts.SourceFile => {
    // Normalize path to fix wrong directory separators on Windows which
    // would break the equality check.
    fileName = path.normalize(fileName);
    if (fileName === cachedLibPath) return cachedLib;
    if (path.isAbsolute(fileName)) fileName = path.relative(process.cwd(), fileName);
    const contents = sources.get(fileName);
    if (contents !== undefined) {
      return ts.createSourceFile(fileName, contents, ts.ScriptTarget.Latest, true);
    }
    throw new Error('unexpected file read of ' + fileName + ' not in ' + toArray(sources.keys()));
  };

  const program = ts.createProgram(toArray(sources.keys()), tsCompilerOptions, host);
  return {program, host};
}

/** Emits transpiled output with tsickle postprocessing.  Throws an exception on errors. */
export function emit(program: ts.Program): {[fileName: string]: string} {
  const transformed: {[fileName: string]: string} = {};
  const {diagnostics} = program.emit(undefined, (fileName: string, data: string) => {
    const options: es5processor.Es5ProcessorOptions = {es5Mode: true, prelude: ''};
    const host: es5processor.Es5ProcessorHost = {
      fileNameToModuleId: (fn) => fn.replace(/^\.\//, ''),
      pathToModuleName: cliSupport.pathToModuleName
    };
    transformed[fileName] = es5processor.processES5(host, options, fileName, data).output;
  });
  if (diagnostics.length > 0) {
    throw new Error(tsickle.formatDiagnostics(diagnostics));
  }
  return transformed;
}

export class GoldenFileTest {
  constructor(public path: string, public tsFiles: string[]) {}

  get name(): string {
    return path.basename(this.path);
  }

  get externsPath(): string {
    return path.join(this.path, 'externs.js');
  }

  get diagnosticsPath(): string {
    return path.join(this.path, 'diagnostics.txt');
  }

  get tsPaths(): string[] {
    return this.tsFiles.map(f => path.join(this.path, f));
  }

  get jsPaths(): string[] {
    return this.tsFiles.filter(f => !/\.d\.ts/.test(f))
        .map(f => path.join(this.path, GoldenFileTest.tsPathToJs(f)));
  }

  public static tsPathToJs(tsPath: string): string {
    return tsPath.replace(/\.tsx?$/, '.js');
  }
}

export function goldenTests(): GoldenFileTest[] {
  const basePath = path.join(__dirname, '..', '..', 'test_files');
  const testNames = fs.readdirSync(basePath);

  const testDirs = testNames.map(testName => path.join(basePath, testName))
                       .filter(testDir => fs.statSync(testDir).isDirectory());
  const tests = testDirs.map(testDir => {
    testDir = path.relative(process.cwd(), testDir);
    let tsPaths = glob.sync(path.join(testDir, '**/*.ts'));
    tsPaths = tsPaths.concat(glob.sync(path.join(testDir, '*.tsx')));
    tsPaths = tsPaths.filter(p => !p.match(/\.tsickle\./) && !p.match(/\.decorated\./));
    const tsFiles = tsPaths.map(f => path.relative(testDir, f));
    return new GoldenFileTest(testDir, tsFiles);
  });

  return tests;
}

// If true, update all the golden .js files to be whatever tsickle
// produces from the .ts source. Do not change this code but run as:
//     UPDATE_GOLDENS=y gulp test
// Then update the variant goldens, if needed:
//     UPDATE_VARIANT_GOLDENS=y gulp test
const UPDATE_GOLDENS = !!process.env.UPDATE_GOLDENS;

// As above, but for variants. This flag is separate so we don't create a ton of
// unwanted variant files because the original golden did not match.
const UPDATE_VARIANT_GOLDENS = !!process.env.UPDATE_VARIANT_GOLDENS;

/**
 * compareAgainstGoldens compares a test output against the content in a golden
 * path, updating the content of the golden when UPDATE_GOLDENS is true.
 *
 * @param output The expected output, where the empty string indicates
 *     the file is expected to exist and be empty, while null indicates
 *     the file is expected to not exist.  (This subtlety is used for
 *     externs files, where the majority of tests are not expected to
 *     produce one.)
 * @param variant The test variant. If set and the "main" expected output at
 *     `path` does not match, `output` will be compared to
 *     `path`.`variant`.`ext`, e.g. for variant being transformer, against
 *     `myoutput.transformer.js`.
 */
export function compareAgainstGolden(
    output: string|null, goldenPath: string, variant: string|null) {
  let variantGoldenPath = goldenPath;
  if (variant) {
    // Check if a special case golden for variant exists, if so, use it for
    // comparison.
    const parts = path.parse(goldenPath);
    parts.base += `.${variant}`;
    variantGoldenPath = path.format(parts);
    if (fs.existsSync(variantGoldenPath)) {
      let mainGoldenMatches = false;
      try {
        [mainGoldenMatches, ] = compareFile(output, goldenPath);
      } catch (e) {
        // main golden file does not match or does not exist, move on to compare.
      }
      if (mainGoldenMatches) {
        const msg = `${variantGoldenPath} exists even though ${goldenPath} matches for ${variant}`;
        expect(variantGoldenPath).to.equal(goldenPath, msg);
      }
      goldenPath = variantGoldenPath;
    }
  }
  const [matches, goldenText] = compareFile(output, goldenPath);

  if (!matches) {
    if ((!variant && UPDATE_GOLDENS) || (variant && UPDATE_VARIANT_GOLDENS)) {
      // This code always updates the variant if a variant is set, i.e. it
      // prefers to special case the variant code, even if no variant previously
      // existed.
      if (variant) goldenPath = variantGoldenPath;
      console.log('Updating golden file for', goldenPath);
      if (output !== null) {
        fs.writeFileSync(goldenPath, output, {encoding: 'utf-8'});
      } else {
        // The desired golden state is for there to be no output file.
        // Ensure no file exists.
        try {
          fs.unlinkSync(goldenPath);
        } catch (e) {
          // ignore.
        }
      }
      return;
    }
  }
  // Trigger the mocha test failure.
  expect(output).to.equal(goldenText, goldenPath);
}

function compareFile(output: string|null, path: string): [boolean, string | null] {
  let golden: string|null = null;
  try {
    golden = fs.readFileSync(path, {encoding: 'utf-8'});
  } catch (e) {
    if (e.code === 'ENOENT' && (output === null || UPDATE_GOLDENS || UPDATE_VARIANT_GOLDENS)) {
      // A missing file is acceptable if we're updating goldens or
      // if we're expected to produce no output (golden and output being null).
      return [output === golden, golden];
    } else {
      throw e;
    }
  }

  // Make sure we have proper line endings when testing on Windows.
  if (golden != null) golden = normalizeLineEndings(golden);
  if (output != null) output = normalizeLineEndings(output);

  return [output === golden, golden];
}
