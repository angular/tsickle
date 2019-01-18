workspace(name = "tsickle")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "6139762b62b37c1fd171d7f22aa39566cb7dc2916f0f801d505a9aaf118c117f",
    strip_prefix = "rules_nodejs-0.9.1",
    url = "https://github.com/bazelbuild/rules_nodejs/archive/0.9.1.zip",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories")

# Force developers to use the same Bazel version as CircleCI, to prevent different
# local behavior than CI.
check_bazel_version("0.18.0")

# NOTE: this rule installs nodejs, npm, and yarn, but does NOT install
# your npm dependencies. You must still run the package manager.
node_repositories(package_json = [
    "//:package.json",
])

http_archive(
    name = "io_bazel_rules_webtesting",
    sha256 = "cecc12f07e95740750a40d38e8b14b76fefa1551bef9332cb432d564d693723c",
    strip_prefix = "rules_webtesting-0.2.0",
    url = "https://github.com/bazelbuild/rules_webtesting/archive/v0.2.0.zip",
)

http_archive(
    name = "build_bazel_rules_typescript",
    sha256 = "3792cc20ef13bb1d1d8b1760894c3320f02a87843e3a04fed7e8e454a75328b6",
    strip_prefix = "rules_typescript-0.15.1",
    url = "https://github.com/bazelbuild/rules_typescript/archive/0.15.1.zip",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")

ts_setup_workspace()
