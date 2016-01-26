import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import {expect} from 'chai';

import {SickleOptions} from '../src/sickle';
import {sickleSource, goldenTests} from './test_support';

let RUN_TESTS_MATCHING: RegExp = null;
// RUN_TESTS_MATCHING = /fields/;

// If true, update all the golden .js files to be whatever sickle
// produces from the .ts source.
let UPDATE_GOLDENS = false;

describe('golden tests', () => {

  goldenTests().forEach((test) => {
    if (RUN_TESTS_MATCHING && !RUN_TESTS_MATCHING.exec(test.name)) {
      it.skip(test.name);
      return;
    }
    let options: SickleOptions = {};
    if (/\.untyped\./.test(test.name)) {
      options.untyped = true;
    }
    var tsSource = fs.readFileSync(test.tsPath, 'utf-8');
    var jsSource = fs.readFileSync(test.jsPath, 'utf-8');
    it(test.name, () => {
      let sickleJs = sickleSource(tsSource, options);
      if (UPDATE_GOLDENS && sickleJs != jsSource) {
        console.log('Updating golden file for', test.jsPath);
        fs.writeFileSync(test.jsPath, sickleJs, 'utf-8');
      }
      expect(sickleJs).to.equal(jsSource);
    });
  });
});
