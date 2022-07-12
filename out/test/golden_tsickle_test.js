"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const cli_support_1 = require("../src/cli_support");
const externs_1 = require("../src/externs");
const jsdoc_1 = require("../src/jsdoc");
const tsickle = require("../src/tsickle");
const testSupport = require("./test_support");
// Set TEST_FILTER=foo to only run tests from the foo package.
// Set TEST_FILTER=foo/bar to also filter for the '/bar' file.
const TEST_FILTER = (() => {
    if (!process.env['TEST_FILTER'])
        return null;
    const [testName, fileName] = process.env['TEST_FILTER'].split('/', 2);
    return {
        testName: new RegExp(testName + (fileName ? '$' : '')),
        fileName: fileName ? new RegExp('/' + fileName) : null
    };
})();
// If true, update all the golden .js files to be whatever tsickle
// produces from the .ts source. Do not change this code but run as:
//     UPDATE_GOLDENS=y bazel run test:golden_test
const UPDATE_GOLDENS = !!process.env['UPDATE_GOLDENS'];
/**
 * compareAgainstGoldens compares a test output against the content in a golden
 * path, updating the content of the golden when UPDATE_GOLDENS is true.
 *
 * @param output The expected output, where the empty string indicates
 *     the file is expected to exist and be empty, while null indicates
 *     the file is expected to not exist.  (This subtlety is used for
 *     externs files, where the majority of tests are not expected to
 *     produce one.)
 * @param goldenPath The absolute path to the matching golden file.
 */
function compareAgainstGolden(output, goldenPath, test) {
    let golden = null;
    try {
        golden = fs.readFileSync(goldenPath, 'utf-8');
    }
    catch (e) {
        if (e.code === 'ENOENT' &&
            (UPDATE_GOLDENS || output === null)) {
            // A missing file is acceptable if we're updating goldens or
            // if we're expected to produce no output.
        }
        else {
            throw e;
        }
    }
    // Make sure we have proper line endings when testing on Windows.
    if (golden != null)
        golden = (0, jsdoc_1.normalizeLineEndings)(golden);
    if (output != null)
        output = (0, jsdoc_1.normalizeLineEndings)(output);
    if (UPDATE_GOLDENS && output !== golden) {
        // Ensure goldenPath refers to the path within the original source root, and
        // not some testing environment symlink.
        goldenPath = fs.lstatSync(goldenPath).isSymbolicLink() ?
            fs.readlinkSync(goldenPath) :
            goldenPath;
        console.log('Updating golden file for', goldenPath);
        if (output !== null) {
            fs.writeFileSync(goldenPath, output, { encoding: 'utf-8' });
        }
        else {
            // We don't delete the file automatically in case the existence of the
            // file triggers an assertion.
            throw new Error(`Expected ${goldenPath} to be absent. Please delete it manually.`);
        }
    }
    else {
        expect(output).withContext(`${goldenPath}`).toEqualWithDiff(golden);
    }
}
// Only run golden tests if we filter for a specific one.
const testFn = TEST_FILTER ? fdescribe : describe;
/**
 * Return the google3 relative name of the filename.
 *
 * This function only works in the limited contexts of these tests.
 */
function rootDirsRelative(filename) {
    // TODO(nickreid): this doesn't work in the open source build.
    const result = filename.split('runfiles/google3/')[1];
    if (!result) {
        return path.relative(path.resolve(__dirname, '..'), filename);
    }
    return result;
}
testFn('golden tests', () => {
    beforeEach(() => {
        testSupport.addDiffMatchers();
    });
    for (const test of testSupport.goldenTests()) {
        if (TEST_FILTER && !TEST_FILTER.testName.test(test.name)) {
            // do not xit(test.name) as that spams a lot of useless console msgs.
            continue;
        }
        let emitDeclarations = true;
        if (test.name === 'fields') {
            emitDeclarations = false;
        }
        it(test.name, () => {
            var _a, _b, _c;
            const inputPaths = test.inputPaths();
            expect(inputPaths.length).toBeGreaterThan(0);
            // Read all the inputs into a map, and create a ts.Program from them.
            const tsSources = new Map();
            for (const tsPath of inputPaths) {
                let tsSource = fs.readFileSync(tsPath, 'utf-8');
                tsSource = (0, jsdoc_1.normalizeLineEndings)(tsSource);
                tsSources.set(tsPath, tsSource);
            }
            const tsCompilerOptions = Object.assign(Object.assign({}, testSupport.compilerOptions), { 
                // Test that creating declarations does not throw
                declaration: emitDeclarations });
            const { program, host: tsHost } = testSupport.createProgramAndHost(tsSources, tsCompilerOptions);
            {
                const diagnostics = ts.getPreEmitDiagnostics(program);
                if (diagnostics.length) {
                    throw new Error(testSupport.formatDiagnostics(diagnostics));
                }
            }
            if (test.isEs5Target) {
                tsCompilerOptions.target = ts.ScriptTarget.ES5;
            }
            const allDiagnostics = new Set();
            const transformerHost = {
                generateExtraSuppressions: false,
                googmodule: true,
                // See test_files/jsdoc_types/nevertyped.ts and
                // test_files/ignored_ambient_external_module/ignored.d.ts
                unknownTypesPaths: new Set([
                    path.join(tsCompilerOptions.rootDir, 'test_files/jsdoc_types/nevertyped.ts'),
                    path.join(tsCompilerOptions.rootDir, 'test_files/ignored_ambient_external_module/ignored.d.ts'),
                ]),
                convertIndexImportShorthand: true,
                transformDecorators: !test.isPureTransformerTest,
                transformTypesToClosure: !test.isPureTransformerTest,
                generateTsMigrationExportsShim: test.isTsmesEnabledTest,
                // Setting this to true matches how we typically run Clutz, but note
                // that the Clutz pass only affects output d.ts files, which in this
                // test suite are only produced for "declaration" tests (tests where
                // test.isDeclarationTest is true).
                addDtsClutzAliases: true,
                untyped: test.isUntypedTest,
                provideExternalModuleDtsNamespace: !test.hasShim,
                logWarning: (diag) => {
                    allDiagnostics.add(diag);
                },
                shouldSkipTsickleProcessing: (fileName) => !tsSources.has(fileName),
                shouldIgnoreWarningsForPath: () => false,
                pathToModuleName: (context, importPath) => {
                    return testSupport.pathToModuleName(tsCompilerOptions.rootDir, context, importPath);
                },
                fileNameToModuleId: (fileName) => {
                    (0, cli_support_1.assertAbsolute)(fileName);
                    fileName = path.relative(tsCompilerOptions.rootDir, fileName);
                    return fileName.replace(/^\.\//, '');
                },
                options: tsCompilerOptions,
                moduleResolutionHost: tsHost,
                rootDirsRelative,
                // TODO(nickreid): move to rootDirsRelative.
                // rootDirsRelative: testSupport.relativeToTsickleRoot,
            };
            const tscOutput = new Map();
            let targetSource = undefined;
            if (TEST_FILTER && TEST_FILTER.fileName) {
                for (const [path] of tsSources.entries()) {
                    if (!TEST_FILTER.fileName.test(path))
                        continue;
                    if (targetSource) {
                        throw new Error(`TEST_FILTER matches more than one file: ${targetSource.fileName} vs ${path}`);
                    }
                    targetSource = program.getSourceFile(path);
                }
                if (!targetSource) {
                    throw new Error(`TEST_FILTER matched no file: ${TEST_FILTER.fileName} vs ${Array.from(tsSources.keys())}`);
                }
            }
            /** Returns true if we test the emitted output for the given path. */
            function shouldCompareOutputToGolden(fileName) {
                // For regular tests we only check .js files, while for declaration
                // tests we only check .d.ts files.
                const supported = [];
                if (test.isPureTransformerTest) {
                    supported.push('.js');
                }
                if (test.isDeclarationTest) {
                    supported.push('.d.ts');
                }
                else {
                    supported.push('.js');
                }
                return supported.some((e) => fileName.endsWith(e));
            }
            const { diagnostics, externs, tsMigrationExportsShimFiles } = tsickle.emit(program, transformerHost, (fileName, data) => {
                if (shouldCompareOutputToGolden(fileName)) {
                    tscOutput.set(fileName, data);
                }
            }, targetSource);
            for (const d of diagnostics) {
                allDiagnostics.add(d);
            }
            const diagnosticsByFile = new Map();
            for (const d of allDiagnostics) {
                const fileName = (_b = (_a = d.file) === null || _a === void 0 ? void 0 : _a.fileName) !== null && _b !== void 0 ? _b : 'unhandled diagnostic with no file name attached';
                let diags = diagnosticsByFile.get(fileName);
                if (!diags)
                    diagnosticsByFile.set(fileName, diags = []);
                diags.push(d);
            }
            if (!test.isDeclarationTest) {
                const sortedPaths = test.jsPaths().sort();
                const actualPaths = Array.from(tscOutput.keys())
                    .map(p => p.replace(/^\.\//, ''))
                    .sort();
                expect(sortedPaths)
                    .withContext(`${test.jsPaths} vs ${actualPaths}`)
                    .toEqual(actualPaths);
            }
            let allExterns = null;
            if (!test.name.endsWith('.no_externs')) {
                // Concatenate externs for the files that are in this tests sources (but
                // not other, shared .d.ts files).
                const filteredExterns = {};
                let anyExternsGenerated = false;
                for (const fileName of tsSources.keys()) {
                    if (externs[fileName]) {
                        anyExternsGenerated = true;
                        filteredExterns[fileName] = externs[fileName];
                    }
                }
                if (anyExternsGenerated) {
                    allExterns =
                        (0, externs_1.getGeneratedExterns)(filteredExterns, tsCompilerOptions.rootDir);
                }
            }
            compareAgainstGolden(allExterns, test.externsPath(), test);
            for (const absFilename of test.tsMigrationExportsShimPaths()) {
                const relativeFilename = rootDirsRelative(absFilename);
                const exportShim = (_c = tsMigrationExportsShimFiles.get(relativeFilename)) !== null && _c !== void 0 ? _c : null;
                compareAgainstGolden(exportShim, absFilename, test);
            }
            for (const [outputPath, output] of tscOutput) {
                const tsPath = outputPath.replace(/\.js$|\.d.ts$/, '.ts').replace(/^\.\//, '');
                const diags = diagnosticsByFile.get(tsPath);
                diagnosticsByFile.delete(tsPath);
                let out = output;
                if (diags) {
                    out = testSupport.formatDiagnostics(diags)
                        .trim()
                        .split('\n')
                        .map(line => `// ${line}\n`)
                        .join('') +
                        out;
                }
                compareAgainstGolden(out, outputPath, test);
            }
            const dtsDiags = [];
            if (diagnosticsByFile.size) {
                for (const [path, diags] of diagnosticsByFile.entries()) {
                    if (path.endsWith('.d.ts')) {
                        dtsDiags.push(...diags);
                        continue;
                    }
                    expect(testSupport.formatDiagnostics(diags))
                        .withContext(`unhandled diagnostics for ${path}`)
                        .toBe('');
                }
            }
            if (dtsDiags.length) {
                compareAgainstGolden(testSupport.formatDiagnostics(dtsDiags), path.join(test.root, 'dtsdiagnostics.txt'), test);
            }
        });
    }
});
//# sourceMappingURL=golden_tsickle_test.js.map