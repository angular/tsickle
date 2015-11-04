require('source-map-support').install();

var clangFormat = require('clang-format');
var formatter = require('gulp-clang-format');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var merge = require('merge2');
var mocha = require('gulp-mocha');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var typescript = require('typescript');

var TSC_OPTIONS = {
  module: "commonjs",
  // allow pulling in files from node_modules until TS 1.5 is in tsd / DefinitelyTyped (the
  // alternative is to include node_modules paths in the src arrays below for compilation)
  noExternalResolve: false,
  noImplicitAny: true,
  declarationFiles: true,
  noEmitOnError: true,
  // Specify the TypeScript version we're using.
  typescript: typescript,
};
var tsProject = ts.createProject(TSC_OPTIONS);

gulp.task('test.check-format', function() {
  return gulp.src(['*.js', 'src/**/*.ts', 'test/**/*.ts'])
      .pipe(formatter.checkFormat('file', clangFormat, {verbose: true}))
      .on('warning', onError);
});

var hasError;
var failOnError = true;

var onError = function(err) {
  hasError = true;
  gutil.log(err.message);
  if (failOnError) {
    process.exit(1);
  }
};

gulp.task('compile', function() {
  hasError = false;
  var tsResult = gulp.src(['src/**/*.ts', 'typings/**/*.d.ts'])
                     .pipe(sourcemaps.init())
                     .pipe(ts(tsProject))
                     .on('error', onError);
  return merge([
    tsResult.dts.pipe(gulp.dest('build/definitions')),
    // Write external sourcemap next to the js file
    tsResult.js.pipe(sourcemaps.write('.')).pipe(gulp.dest('build/src')),
    tsResult.js.pipe(gulp.dest('build/src')),
  ]);
});

gulp.task('test.compile', ['compile'], function(done) {
  if (hasError) {
    done();
    return;
  }
  return gulp.src(['test/*.ts', 'typings/**/*.d.ts'], {base: '.'})
      .pipe(sourcemaps.init())
      .pipe(ts(tsProject))
      .on('error', onError)
      .js.pipe(sourcemaps.write())
      .pipe(gulp.dest('build/'));  // '/test/' comes from base above.
});

gulp.task('test.unit', ['test.compile'], function(done) {
  if (hasError) {
    done();
    return;
  }
  return gulp.src(['build/test/**/*.js', '!build/test/**/e2e*.js']).pipe(mocha({timeout: 1000}));
});

gulp.task('test.e2e', ['test.compile'], function(done) {
  if (hasError) {
    done();
    return;
  }
  return gulp.src(['build/test/**/e2e*.js']).pipe(mocha({timeout: 10000}));
});

gulp.task('test', ['test.unit', 'test.e2e', 'test.check-format']);

gulp.task('watch', ['test.unit', 'test.check-format'], function() {
  failOnError = false;
  // Avoid watching generated .d.ts in the build (aka output) directory.
  return gulp.watch(
      ['src/**/*.ts', 'test/**/*.ts', 'test_files/**'], {ignoreInitial: true}, ['test.unit']);
});

gulp.task('default', ['compile']);
