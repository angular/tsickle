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
      let sickleSource = annotateSource(test.tsPath, tsSource, options);
      let sickleGolden = fs.readFileSync(test.sicklePath, 'utf-8');
      if (UPDATE_GOLDENS && sickleSource != sickleGolden) {
        console.log('Updating golden file for', test.sicklePath);
        fs.writeFileSync(test.sicklePath, sickleSource, 'utf-8');
        sickleGolden = sickleSource;
      }
      expect(sickleSource).to.equal(sickleGolden);

      // Run sickled TypeScript through TypeScript compiler
      // and compare against goldens.
      let es6Source = transformSource(test.sicklePath, sickleSource);
      let es6Golden = fs.readFileSync(test.es6Path, 'utf-8');
      if (UPDATE_GOLDENS && es6Source != es6Golden) {
        console.log('Updating golden file for', test.es6Path);
        fs.writeFileSync(test.es6Path, es6Source, 'utf-8');
        es6Golden = es6Source;
      }
      expect(es6Source).to.equal(es6Golden);
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
});
