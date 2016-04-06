import * as fs from 'fs';
import * as path from 'path';
import {expect} from 'chai';

import * as sickle from '../src/sickle';
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
  goldenTests().forEach((test) => {
    if (RUN_TESTS_MATCHING && !RUN_TESTS_MATCHING.exec(test.name)) {
      it.skip(test.name);
      return;
    }
    let options: sickle.Options = {};
    if (/\.untyped\b/.test(test.name)) {
      options.untyped = true;
    }
    it(test.name, () => {
      let tsSource = fs.readFileSync(test.tsPath, 'utf-8');

      // Run TypeScript through sickle and compare against goldens.
      let {output, externs, diagnostics} = annotateSource(test.tsPath, tsSource, options);

      // If there were any diagnostics, convert them into strings for
      // the golden output.
      let fileOutput = output;
      if (diagnostics.length > 0) {
        // Munge the filenames in the diagnostics so that they don't include
        // the sickle checkout path.
        for (let diag of diagnostics) {
          let fileName = diag.file.fileName;
          diag.file.fileName = fileName.substr(fileName.indexOf('test_files'));
        }
        fileOutput = sickle.formatDiagnostics(diagnostics) + '\n====\n' + output;
      }
      compareAgainstGolden(fileOutput, test.sicklePath);
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
    expect(sickle.getJSDocAnnotation(source)).to.equal(null);
  });
  it('grabs plain text from jsdoc', () => {
    let source = '/** jsdoc comment */';
    expect(sickle.getJSDocAnnotation(source)).to.deep.equal({tags: [{text: 'jsdoc comment'}]});
  });
  it('gathers @tags from jsdoc', () => {
    let source = `/**
  * @param foo
  * @param bar multiple
  *    line comment
  * @return foobar
  * @nosideeffects
  */`;
    expect(sickle.getJSDocAnnotation(source)).to.deep.equal({
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
    expect(() => sickle.getJSDocAnnotation(source)).to.throw(Error);
  });
  it('rejects @type annotations', () => {
    let source = `/** @type {string} foo */`;
    expect(() => sickle.getJSDocAnnotation(source)).to.throw(Error);
  });
  it('allows @suppress annotations', () => {
    let source = `/** @suppress {checkTypes} I hate types */`;
    expect(sickle.getJSDocAnnotation(source)).to.deep.equal({
      tags: [{tagName: 'suppress', text: '{checkTypes} I hate types'}]
    });
  });
});

describe('convertCommonJsToGoogModule', () => {
  function pathToModuleName(context: string, fileName: string) {
    if (fileName[0] === '.') {
      fileName = path.join(path.dirname(context), fileName);
    }
    return fileName.replace(/\//g, '$');
  }

  function expectCommonJs(fileName: string, content: string) {
    fileName = fileName.substring(0, fileName.lastIndexOf('.'));
    return expect(sickle.convertCommonJsToGoogModule(fileName, content, pathToModuleName).output);
  }

  it('adds a goog.module call', () => {
    // NB: no line break added below.
    expectCommonJs('a.js', `console.log('hello');`)
        .to.equal(`goog.module('a');console.log('hello');`);
  });

  it('strips use strict directives', () => {
    // NB: no line break added below.
    expectCommonJs('a.js', `"use strict";
console.log('hello');`)
        .to.equal(`goog.module('a');
console.log('hello');`);
  });

  it('converts require calls', () => {
    expectCommonJs('a.js', `var r = require('req/mod');`)
        .to.equal(`goog.module('a');var r = goog.require('req$mod');`);
  });

  it('converts require calls without assignments on first line', () => {
    expectCommonJs('a.js', `require('req/mod');`)
        .to.equal(`goog.module('a');var unused_0_ = goog.require('req$mod');`);
  });

  it('converts require calls without assignments on a new line', () => {
    expectCommonJs('a.js', `
require('req/mod');
require('other');`)
        .to.equal(`goog.module('a');
var unused_0_ = goog.require('req$mod');
var unused_1_ = goog.require('other');`);
  });

  it('converts require calls without assignments after comments', () => {
    expectCommonJs('a.js', `
// Comment
require('req/mod');`)
        .to.equal(`goog.module('a');
// Comment
var unused_0_ = goog.require('req$mod');`);
  });

  it('converts const require calls', () => {
    expectCommonJs('a.js', `const r = require('req/mod');`)
        .to.equal(`goog.module('a');var r = goog.require('req$mod');`);
  });

  it('resolves relative module URIs', () => {
    // See below for more fine-grained unit tests.
    expectCommonJs('a/b.js', `var r = require('./req/mod');`)
        .to.equal(`goog.module('a$b');var r = goog.require('a$req$mod');`);
  });

  it('resolves default goog: module imports', () => {
    expectCommonJs('a/b.js', `
var goog_use_Foo_1 = require('goog:use.Foo');
console.log(goog_use_Foo_1.default);`)
        .to.equal(`goog.module('a$b');
var goog_use_Foo_1 = goog.require('use.Foo');
console.log(goog_use_Foo_1        );`);
    // NB: the whitespace above matches the .default part, so that
    // source maps are not impacted.
  });

  it('leaves single .default accesses alone', () => {
    // This is a repro for a bug when no goog: symbols are found.
    expectCommonJs('a/b.js', `
console.log(this.default);
console.log(foo.bar.default);`)
        .to.equal(`goog.module('a$b');
console.log(this.default);
console.log(foo.bar.default);`);
  });

  it('inserts the module after "use strict"', () => {
    expectCommonJs('a/b.js', `/**
* docstring here
*/
"use strict";
var foo = bar;
`).to.equal(`goog.module('a$b');/**
* docstring here
*/

var foo = bar;
`);
  });
});
