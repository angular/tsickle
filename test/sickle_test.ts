import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import {expect} from 'chai';

import {annotateProgram, formatDiagnostics} from '../src/sickle';
import {expectSource, goldenTests} from './test_support';

describe('golden tests', () => {
  goldenTests().forEach((test) => {
    var tsSource = fs.readFileSync(test.tsPath, 'utf-8');
    var jsSource = fs.readFileSync(test.jsPath, 'utf-8');
    it(test.name, () => { expectSource(tsSource).to.equal(jsSource); });
  });
});
