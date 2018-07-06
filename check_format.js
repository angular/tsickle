/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const childProcess = require('child_process');
const fs = require('fs');
const glob = require('glob');

const CLANG_FORMAT = 'node_modules/.bin/clang-format';

/**
 * Checks that a path is formatted.
 * @return new text of file if it needs formatting or null otherwise.
 */
function checkFile(path) {
  const source = fs.readFileSync(path, 'utf8');
  const formatted = childProcess.execFileSync(CLANG_FORMAT, [path], {encoding: 'utf8'});
  if (source !== formatted) {
    return formatted;
  }
  return null;
}

function main(args) {
  const fix = args[0] === '--fix';
  const sourceFiles = glob.sync('{*.js,src/**/*.[jt]s,test/**/*.[jt]s}');
  for (const path of sourceFiles) {
    const newText = checkFile(path);
    if (newText != null) {
      if (fix) {
        fs.writeFileSync(path, newText);
        console.log(`wrote ${path}`);
      } else {
        console.error(`${path} not formatted; run 'node check_format.js --fix'`);
        return 1;
      }
    }
  }
  return 0;
}

process.exitCode = main(process.argv.slice(2));
