workspace(name = "tsickle")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "build_bazel_rules_nodejs",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/0.18.5/rules_nodejs-0.18.5.tar.gz"],
    sha256 = "c8cd6a77433f7d3bb1f4ac87f15822aa102989f8e9eb1907ca0cad718573985b",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories", "yarn_install")

# Force developers to use the same Bazel version as CircleCI, to prevent different
# local behavior than CI.
check_bazel_version("0.22.0")

# Just installs nodejs and yarn, provides a `@nodejs//` workspace
node_repositories()

# Run yarn install to create a node_modules tree for Bazel's use
# In a future release, this will install into the dev's node_modules folder
# but for now, you must also run yarn install locally for the editor to find
# things like @types files
yarn_install(
  name = "npm",
  package_json = "//:package.json",
  yarn_lock = "//:yarn.lock",
)

# Install all Bazel dependencies needed for npm packages that supply Bazel rules
# In particular this installs the TypeScript rules
load("@npm//:install_bazel_dependencies.bzl", "install_bazel_dependencies")

install_bazel_dependencies()

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")

ts_setup_workspace()
