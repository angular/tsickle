package(default_visibility = ["//visibility:public"])

exports_files(["tsconfig.json"])

# NOTE: this will move to node_modules/BUILD in a later release
filegroup(
    name = "node_modules",
    srcs = glob(["node_modules/**/*"]),
)

filegroup(
    name = "test_files",
    srcs = glob([
        "test_files/**/*",
        "third_party/**/*",
        # The test suites run version-specific TypeScript compilers,
        # but they all need the 'tslib' package to be available in
        # a node_modules directory *above* the test/ directory.  So
        # we must provide this extra directory as data to those tests.
        "node_modules/tslib/*",
    ]),
)

load("@build_bazel_rules_nodejs//:defs.bzl", "npm_package")

npm_package(
    name = "npm_package",
    srcs = [
        "LICENSE",
        "README.md",
        "package.json",
    ],
    replacements = {
        # Allow the resulting package to be published
        "\"private\": true": "\"private\": false",
    },
    deps = [
        "//src",
    ],
)
