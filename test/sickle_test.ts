import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import {expect} from 'chai';

import {annotateProgram, formatDiagnostics} from '../src/sickle';
import {expectSource, checkClosureCompile} from './test_support';

describe('golden tests', () => {
  var tsExtRe = /\.ts$/;
  var testFolder = path.join(__dirname, '..', '..', 'test_files');
  var files = fs.readdirSync(testFolder).filter((fn) => !!fn.match(tsExtRe));
  var jsMasters: string[] = [];
  files.forEach((tsFilename) => {
    var tsPath = path.join(testFolder, tsFilename);
    var tsSource = fs.readFileSync(tsPath, 'utf-8');
    var jsPath = tsPath.replace(tsExtRe, '.js');
    jsMasters.push(jsPath);
    var jsSource = fs.readFileSync(jsPath, 'utf-8');
    it(tsFilename, () => { expectSource(tsSource).to.equal(jsSource); });
  });

  it('generates correct Closure code',
     (done: (err: Error) => void) => { checkClosureCompile(jsMasters, done); });
});
