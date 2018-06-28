workspace(name="tsickle")

http_archive(
    name = "build_bazel_rules_nodejs",
    url = "https://github.com/bazelbuild/rules_nodejs/archive/0.9.1.zip",
    strip_prefix = "rules_nodejs-0.9.1",
    sha256 = "6139762b62b37c1fd171d7f22aa39566cb7dc2916f0f801d505a9aaf118c117f",
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
    name = "io_bazel_rules_webtesting",
    url = "https://github.com/bazelbuild/rules_webtesting/archive/v0.2.0.zip",
    strip_prefix = "rules_webtesting-0.2.0",
    sha256 = "cecc12f07e95740750a40d38e8b14b76fefa1551bef9332cb432d564d693723c",
)

http_archive(
    name = "build_bazel_rules_typescript",
    url = "https://github.com/rkirov/rules_typescript/archive/v0.16.0.zip",
    strip_prefix = "rules_typescript-0.16.0",
    sha256 = "f5aedd3a792e5af19cd0c0f0318cb692e2989e816e896e794152d07808fccacd",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")

ts_setup_workspace()
