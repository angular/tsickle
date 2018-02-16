# Tsickle - TypeScript to Closure Translator [![Linux build](https://travis-ci.org/angular/tsickle.svg?branch=master)](https://travis-ci.org/angular/tsickle) [![Windows build](https://ci.appveyor.com/api/projects/status/puxdblmlqbofqqt1/branch/master?svg=true)](https://ci.appveyor.com/project/alexeagle/tsickle/branch/master)

Tsickle converts TypeScript code into a form acceptable to the [Closure
Compiler].  This allows using TypeScript to transpile your sources, and then
using Closure Compiler to bundle and optimize them, while taking advantage of
type information in Closure Compiler.

[Closure Compiler]: https://github.com/google/closure-compiler/

## What conversion means

A (non-exhaustive) list of the sorts of transformations Tsickle applies:

- inserts Closure-compatible JSDoc annotations on functions/classes/etc
- converts ES6 modules into `goog.module` modules
- generates externs.js from TypeScript d.ts (and `declare`, see below)
- declares types for class member variables
- translates `export * from ...` into a form Closure accepts
- converts TypeScript enums into a form Closure accepts
- reprocesses all jsdoc to strip Closure-invalid tags

In general the goal is that you write valid TypeScript and Tsickle handles
making it valid Closure Compiler code.

## Warning: work in progress

We already use tsickle within Google to minify our apps (including those using
Angular), but we have less experience using tsickle with the various JavaScript
builds that are seen outside of Google.

We would like to make tsickle usable for everyone but right now if you'd like
to try it you should expect to spend some time debugging and reporting bugs.

## Usage

### Project Setup

Tsickle works by wrapping `tsc`.  To use it, you must set up your project such
that it builds correctly when you run `tsc` from the command line, by
configuring the settings in `tsconfig.json`.

If you have complicated tsc command lines and flags in a build file (like a
gulpfile etc.) Tsickle won't know about it.  Another reason it's nice to put
everything in `tsconfig.json` is so your editor inherits all these settings as
well.

### Invocation

Run `tsickle --help` for the full syntax, but basically you provide any tsickle
specific options and use it as a TypeScript compiler.

### Differences from TypeScript

Closure and TypeScript are not identical.  Tsickle hides most of the
differences, but users must still be aware of some differences.

#### `declare`

Any declaration in a `.d.ts` file, as well as any declaration tagged with
`declare ...`, is intepreted by Tsickle as a name that should be preserved
through Closure compilation (i.e. not renamed into something shorter).  Use it
any time the specific string names of your fields are significant.  That would
most often happen when the object either coming from outside your program, or
being passed out of the program.

Example:

    declare interface JSONResult {
        username: string;
    }
    let r = JSON.parse(input) as JSONResult;
    console.log(r.username);

By adding `declare` to the interface (or if it were in a `.d.ts` file), Tsickle
will inform Closure that it must use exactly the field name `.username` (and not
e.g. `.a`) in the output JS.  This matters for this example because the input
JSON probably uses the string `'username'` and not whatever name Closure would
invent for it.  (Note: `declare` on an interface has no additional meaning in
pure TypeScript.)

#### Exporting decorators

An exporting decorator is a decorator that has `@ExportDecoratedItems` in its
JSDoc.

The names of elements that have an exporting decorator are preserved through
the Closure compilation process by applying an `@export` tag to them.

Example:

    /** @ExportDecoratedItems */
    function myDecorator() {
      // ...
    }

    @myDecorator()
    class DoNotRenameThisClass { ... }

## Development

### One-time setup

Run `bazel run @yarn//:yarn --script_path=yarn_install.sh && ./yarn_install.sh`
to install the dependencies.

> This avoids occupying the `bazel` server, so that `yarn` can call `bazel`
> again.
> Ideally we should just use `bazel-run.sh @yarn//:yarn`, see
> https://stackoverflow.com/questions/47082298/how-can-users-get-bazel-run-sh

### Test commands

- `ibazel test test:unit_test` executes the unit tests in watch mode (use `bazel test test:unit_test` for a
  single run),
- `bazel test test:e2e_test` executes the e2e tests,
- `bazel test test:golden_test` executes the golden tests,
- `gulp test.check-format` checks the source code formatting using
  `clang-format`,
- `yarn test` runs unit tests, e2e tests and checks the source code formatting.

### Debugging

You can debug tests by using `bazel run` and passing `--node_options=--inspect`. For example, to
debug a specific golden test:

```shell
TEST_FILTER=my_golden_test ibazel run //test:golden_test -- --node_options=--inspect
```

Then open [about:inspect] in Chrome and choose "about:inspect". Chrome will launch a debugging
session on any node process that starts with a debugger listening on one of the listed ports. The
tsickle tests and Chrome both default to `localhost:9229`, so things should work out of the box.

VS Code can also connect using the inspect protocol. It doesn't support automatically reconnecting
or any way to re-run the test suite though, so it is a less convenient. You can start the node
process passing an extra `--node_options=--debug-brk` (in addition to the parameters above) to have
Node wait before program execution, so you have time to attach VS Code.

### Updating Goldens

Run `UPDATE_GOLDENS=y bazel run test:golden_test` to have the test suite update
the goldens in `test_files/...`.

### Environment variables

Pass the flag `--action_env=TEST_FILTER=<REGEX>` to bazel test to limit the
end-to-end test (found in `test_files/...`) run tests with a name matching the
regex.

### Releasing

On a new branch, run `npm version <major|minor|patch|...> -m 'rel: %s'` (see
`npm help version` for details). It will update the version in `package.json`,
commit the changes, and create a git tag. Now you push the branch, get it
reviewed and merged.

Run `bazel run :npm_package.publish` from the master branch
(you must be logged into the `angular` shared npm account).
