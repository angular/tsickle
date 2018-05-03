workspace(name="tsickle")

http_archive(
    name = "build_bazel_rules_nodejs",
    url = "https://github.com/bazelbuild/rules_nodejs/archive/0.8.0.zip",
    strip_prefix = "rules_nodejs-0.8.0",
    sha256 = "4e40dd49ae7668d245c3107645f2a138660fcfd975b9310b91eda13f0c973953",
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
    "//:package.json",
])

http_archive(
    name = "build_bazel_rules_typescript",
    url = "https://github.com/bazelbuild/rules_typescript/archive/0.12.3.zip",
    strip_prefix = "rules_typescript-0.12.3",
    sha256 = "967068c3540f59407716fbeb49949c1600dbf387faeeab3089085784dd21f60c",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")

ts_setup_workspace()
