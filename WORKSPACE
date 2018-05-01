workspace(name="tsickle")

http_archive(
    name = "build_bazel_rules_nodejs",
    url = "https://github.com/bazelbuild/rules_nodejs/archive/092404e3b47e1144ecfc2937d3729b717b1052bf.zip",
    strip_prefix = "rules_nodejs-092404e3b47e1144ecfc2937d3729b717b1052bf",
    sha256 = "5e3dd3f76a043687939a14ce6aee3049f8bd97d2cd885ef2105ac344d05213a3",
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
