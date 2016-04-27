# Tsickle - TypeScript to Closure Annotator [![Build Status](https://travis-ci.org/angular/tsickle.svg?branch=master)](https://travis-ci.org/angular/tsickle)

Tsickle processes TypeScript and adds [Closure Compiler](https://github.com/google/closure-compiler/)
-compatible JSDoc annotations. This allows using TypeScript to transpile your sources, and then
Closure Compiler to bundle and optimize them, while taking advantage of type information in Closure
Compiler.

## Installation

- execute `npm i` to install the dependencies,

## Gulp tasks

- `gulp watch` executes the unit tests in watch mode (use `gulp test.unit` for a single run),
- `gulp test.e2e` executes the e2e tests,
- `gulp test.check-format` checks the source code formatting using `clang-format`,
- `gulp test` runs unit tests, e2e tests and checks the source code formatting.
