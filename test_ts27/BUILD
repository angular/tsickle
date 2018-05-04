package(default_visibility = ["//:__subpackages__"])

filegroup(name = "node_modules", srcs = glob(["node_modules/**/*"]), testonly=1)

load("@build_bazel_rules_nodejs//:defs.bzl", "jasmine_node_test")

jasmine_node_test(
    name = "unit_test",
    srcs = [
        "check_ts_version.js",
        "//test:unit_test_lib",
    ],
    node_modules = ":node_modules",
)

jasmine_node_test(
    name = "golden_test",
    srcs = [
        "check_ts_version.js",
        "//test:golden_test_lib",
    ],
    node_modules = ":node_modules",
    data = ["//:test_files"],
)

jasmine_node_test(
    name = "e2e_test",
    srcs = [
      "check_ts_version.js",
      "//test:e2e_test_lib",
    ],
    data = ["//:test_files"],
    node_modules = ":node_modules",
)
