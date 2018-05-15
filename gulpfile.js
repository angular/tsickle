/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

var clangFormat = require('clang-format');
var formatter = require('gulp-clang-format');
var gulp = require('gulp');

var onError = function(err) {
  process.exit(1);
};

const formatted = ['*.js', 'src/**/*.ts', 'test/**/*.ts'];

gulp.task('format', function() {
  return gulp.src(formatted, {base: '.'})
      .pipe(formatter.format('file', clangFormat))
      .pipe(gulp.dest('.'));
});

gulp.task('test.check-format', function() {
  return gulp.src(formatted)
      .pipe(formatter.checkFormat('file', clangFormat, {verbose: true}))
      .on('warning', onError);
});
