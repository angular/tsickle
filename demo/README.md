# tsickle demo

This sample app demonstrates how you might call tsickle from a node
program. It's not really fleshed out as a full driver of tsickle
(see https://github.com/angular/tsickle/issues/1075 for some problems)
but it's enough for a demo.

## Build

To build the demo:

```sh
$ yarn run build  # runs tsc
```

## Usage

This demo driver works by wrapping `tsc`. To use it, you must set up your
project such that it builds correctly when you run `tsc` from the
command line, by configuring the settings in `tsconfig.json`.

Run with `--help` to see flags:

```sh
$ yarn run demo --help
```

The demo program passes TypeScript flags after `--` on to `tsc`:

```sh
$ yarn run demo -- -p path/to/tsconfig.json
```

## Developing

To work on this and the main `tsickle` at the same time, use `yarn link`:

1.  From the parent directory, `cd bazel-bin/npm_package && yarn link` .
1.  From this directory, `yarn link tsickle` .

Now you can `bazel build :npm_package` from the parent directory to update
the tsickle used by this.

(Note that because of how bazel lays out its output, you must run node
with the `--preserve-symlinks` flag when running this program. This is
done by `yarn run demo` for you.)
