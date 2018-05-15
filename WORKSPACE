workspace(name="tsickle")

http_archive(
    name = "build_bazel_rules_nodejs",
    url = "https://github.com/bazelbuild/rules_nodejs/archive/851e4125697a68444854c6f72f1dbf1793a25281.zip",
    strip_prefix = "rules_nodejs-851e4125697a68444854c6f72f1dbf1793a25281",
    sha256 = "a6c557c50cbd977c1f63645077c66d437ac69ca9b032b9bc802a999ed9897029",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories")

# Force developers to use the same Bazel version as Travis,
# to prevent different local behavior than CI.
# See travis_install.sh
check_bazel_version("0.9.0")

# NOTE: this rule installs nodejs, npm, and yarn, but does NOT install
# your npm dependencies. You must still run the package manager.
node_repositories(package_json = [
    # Install TS 2.4 + 2.5 first, since the other package.json relies on it
    # in order to build its sources.
    "//test_ts24:package.json",
    "//test_ts25:package.json",
    "//test_ts26:package.json",
    "//test_ts27:package.json",
    "//:package.json",
])

http_archive(
    name = "build_bazel_rules_typescript",
    url = "https://github.com/bazelbuild/rules_typescript/archive/cfc3bf8220b630436c3102c7b78f62417186f9b9.zip",
    strip_prefix = "rules_typescript-cfc3bf8220b630436c3102c7b78f62417186f9b9",
    sha256 = "6d7f4889fa60a516d01c6d5bb7402f9c07433dbb49c86e68d40716ba30e47297",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")

ts_setup_workspace()
