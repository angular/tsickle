workspace(
  name = "tsickle",
  managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "1249a60f88e4c0a46d78de06be04d3d41e7421dcfa0c956de65309a7b7ecf6f4",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/0.38.0/rules_nodejs-0.38.0.tar.gz"],
)

load("@build_bazel_rules_nodejs//:index.bzl", "check_bazel_version", "yarn_install")
yarn_install(
    # Name this npm so that Bazel Label references look like @npm//package
    name = "npm",
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)

# Force developers to use the same Bazel version as CircleCI, to prevent different
# local behavior than CI.
check_bazel_version("0.29.0")

load("@npm//:install_bazel_dependencies.bzl", "install_bazel_dependencies")
install_bazel_dependencies()

load("@npm_bazel_typescript//:index.bzl", "ts_setup_workspace")
ts_setup_workspace()
