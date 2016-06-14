import {expect} from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import * as tsickle from '../src/tsickle';

import * as test_support from './test_support';

let RUN_TESTS_MATCHING: RegExp = null;
// RUN_TESTS_MATCHING = /fields/;

// If true, update all the golden .js files to be whatever tsickle
// produces from the .ts source. Do not change this code but run as:
//     UPDATE_GOLDENS=y gulp test
const UPDATE_GOLDENS = !!process.env.UPDATE_GOLDENS;

/**
 * compareAgainstGoldens compares a test output against the content in a golden
 * path, updating the content of the golden when UPDATE_GOLDENS is true.
 *
 * @param output The expected output, where the empty string indicates
 *    the file is expected to exist and be empty, while null indicates
 *    the file is expected to not exist.  (This subtlety is used for
 *    externs files, where the majority of tests are not expected to
 *    produce one.)
 */
function compareAgainstGolden(output: string, path: string) {
  let golden: string = null;
  try {
    golden = fs.readFileSync(path, 'utf-8');
  } catch (e) {
    if (e.code === 'ENOENT' && (UPDATE_GOLDENS || output === null)) {
      // A missing file is acceptable if we're updating goldens or
      // if we're expected to produce no output.
    } else {
      throw e;
    }
  }

  if (UPDATE_GOLDENS && output !== golden) {
    console.log('Updating golden file for', path);
    if (output !== null) {
      fs.writeFileSync(path, output, 'utf-8');
    } else {
      // The desired golden state is for there to be no output file.
      // Ensure no file exists.
      try {
        fs.unlinkSync(path);
      } catch (e) {
        // ignore.
      }
    }
  } else {
    expect(output).to.equal(golden);
  }
}

describe('golden tests', () => {
  test_support.goldenTests().forEach((test) => {
    if (RUN_TESTS_MATCHING && !RUN_TESTS_MATCHING.exec(test.name)) {
      it.skip(test.name);
      return;
    }
    let options: tsickle.Options = {};
    if (/\.untyped\b/.test(test.name)) {
      options.untyped = true;
    }
    it(test.name, () => {
      // Read all the inputs into a map, and create a ts.Program from them.
      let tsSources: {[fileName: string]: string} = {};
      for (let tsFile of test.tsFiles) {
        let tsPath = path.join(test.path, tsFile);
        let tsSource = fs.readFileSync(tsPath, 'utf-8');
        tsSources[tsPath] = tsSource;
      }
      let program = test_support.createProgram(tsSources);

      // Tsickle-annotate all the sources, comparing against goldens, and gather the
      // generated externs and tsickle-processed sources.
      let allExterns: string = null;
      let tsickleSources: {[fileName: string]: string} = {};
      for (let tsPath of Object.keys(tsSources)) {
        let warnings: ts.Diagnostic[] = [];
        options.logWarning = (diag: ts.Diagnostic) => { warnings.push(diag); };
        // Run TypeScript through tsickle and compare against goldens.
        let {output, externs, diagnostics} =
            tsickle.annotate(program, program.getSourceFile(tsPath), options);
        if (externs) allExterns = externs;

        // If there were any diagnostics, convert them into strings for
        // the golden output.
        let fileOutput = output;
        diagnostics.push(...warnings);
        if (diagnostics.length > 0) {
          // Munge the filenames in the diagnostics so that they don't include
          // the tsickle checkout path.
          for (let diag of diagnostics) {
            let fileName = diag.file.fileName;
            diag.file.fileName = fileName.substr(fileName.indexOf('test_files'));
          }
          fileOutput = tsickle.formatDiagnostics(diagnostics) + '\n====\n' + output;
        }
        let tsicklePath = tsPath.replace(/.ts(x)?$/, '.tsickle.ts$1');
        expect(tsicklePath).to.not.equal(tsPath);
        compareAgainstGolden(fileOutput, tsicklePath);
        tsickleSources[tsPath] = output;
      }
      compareAgainstGolden(allExterns, test.externsPath);

      // Run tsickled TypeScript through TypeScript compiler
      // and compare against goldens.
      program = test_support.createProgram(tsickleSources);
      let jsSources = test_support.emit(program);
      for (let jsPath of Object.keys(jsSources)) {
        compareAgainstGolden(jsSources[jsPath], jsPath);
      }
    });
  });
});

describe('getJSDocAnnotation', () => {
  it('does not get non-jsdoc values', () => {
    let source = '/* ordinary comment */';
    expect(tsickle.getJSDocAnnotation(source)).to.equal(null);
  });
  it('grabs plain text from jsdoc', () => {
    let source = '/** jsdoc comment */';
    expect(tsickle.getJSDocAnnotation(source)).to.deep.equal({tags: [{text: 'jsdoc comment'}]});
  });
  it('gathers @tags from jsdoc', () => {
    let source = `/**
  * @param foo
  * @param bar multiple
  *    line comment
  * @return foobar
  * @nosideeffects
  */`;
    expect(tsickle.getJSDocAnnotation(source)).to.deep.equal({
      tags: [
        {tagName: 'param', parameterName: 'foo'},
        {tagName: 'param', parameterName: 'bar', text: 'multiple line comment'},
        {tagName: 'return', text: 'foobar'},
        {tagName: 'nosideeffects'},
      ]
    });
  });
  it('rejects type annotations in parameters', () => {
    let source = `/**
  * @param {string} foo
*/`;
    expect(() => tsickle.getJSDocAnnotation(source)).to.throw(Error);
  });
  it('rejects @type annotations', () => {
    let source = `/** @type {string} foo */`;
    expect(() => tsickle.getJSDocAnnotation(source)).to.throw(Error);
  });
  it('allows @suppress annotations', () => {
    let source = `/** @suppress {checkTypes} I hate types */`;
    expect(tsickle.getJSDocAnnotation(source)).to.deep.equal({
      tags: [{tagName: 'suppress', text: '{checkTypes} I hate types'}]
    });
  });
});
