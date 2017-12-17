workspace(name="tsickle")

load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
    name = "build_bazel_rules_nodejs",
    remote = "https://github.com/bazelbuild/rules_nodejs.git",
    tag = "0.3.0",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories")

# NOTE: this rule installs nodejs, npm, and yarn, but does NOT install
# your npm dependencies. You must still run the package manager.
node_repositories(package_json = [
    # Install TS 2.4 + 2.5 first, since the other package.json relies on it
    # in order to build its sources.
    "//test_ts24:package.json",
    "//test_ts25:package.json",
    "//:package.json",
])

git_repository(
    name = "build_bazel_rules_typescript",
    remote = "https://github.com/bazelbuild/rules_typescript.git",
    tag = "0.6.0",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_repositories")

ts_repositories()
