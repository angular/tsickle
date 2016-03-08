import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import {expect} from 'chai';

import {SickleOptions, getJSDocAnnotation} from '../src/sickle';
import {annotateSource, transformSource, goldenTests} from './test_support';

let RUN_TESTS_MATCHING: RegExp = null;
// RUN_TESTS_MATCHING = /fields/;

// If true, update all the golden .js files to be whatever sickle
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
    if (e.code == 'ENOENT' && (UPDATE_GOLDENS || output === null)) {
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
      }
    }
  } else {
    expect(output).to.equal(golden);
  }
}

describe('golden tests', () => {
  goldenTests().forEach((test) => {
    if (RUN_TESTS_MATCHING && !RUN_TESTS_MATCHING.exec(test.name)) {
      it.skip(test.name);
      return;
    }
    let options: SickleOptions = {};
    if (/\.untyped\b/.test(test.name)) {
      options.untyped = true;
    }
    it(test.name, () => {
      var tsSource = fs.readFileSync(test.tsPath, 'utf-8');

      // Run TypeScript through sickle and compare against goldens.
      let {output, externs} = annotateSource(test.tsPath, tsSource, options);
      compareAgainstGolden(output, test.sicklePath);
      compareAgainstGolden(externs, test.externsPath);

      // Run sickled TypeScript through TypeScript compiler
      // and compare against goldens.
      let es6Source = transformSource(test.sicklePath, output);
      compareAgainstGolden(es6Source, test.es6Path);
    });
  });
});

describe('getJSDocAnnotation', () => {
  it('does not get non-jsdoc values', () => {
    let source = '/* ordinary comment */';
    expect(getJSDocAnnotation(source)).to.equal(null);
  });
  it('grabs plain text from jsdoc', () => {
    let source = '/** jsdoc comment */';
    expect(getJSDocAnnotation(source)).to.deep.equal({tags: [{text: 'jsdoc comment'}]});
  });
  it('gathers @tags from jsdoc', () => {
    let source = `/**
  * @param foo
  * @param bar multiple
  *    line comment
  * @return foobar
  * @nosideeffects
  */`;
    expect(getJSDocAnnotation(source)).to.deep.equal({
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
    expect(() => getJSDocAnnotation(source)).to.throw(Error);
  });
  it('rejects @type annotations', () => {
    let source = `/** @type {string} foo */`;
    expect(() => getJSDocAnnotation(source)).to.throw(Error);
  });
  it('allows @suppress annotations', () => {
    let source = `/** @suppress {checkTypes} I hate types */`;
    expect(getJSDocAnnotation(source))
        .to.deep.equal({tags: [{tagName: 'suppress', text: '{checkTypes} I hate types'}]})
  });
});
