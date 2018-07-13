package(default_visibility = ["//visibility:public"])

load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")
load("@build_bazel_rules_nodejs//:defs.bzl", "jasmine_node_test")

ts_library(
    name = "test_support",
    srcs = ["test_support.ts"],
    tsconfig = "//:tsconfig.json",
    deps = ["//src"],
)

ts_library(
    name = "unit_test_lib",
    srcs = [
        "ast_printing_transform.ts",
        "decorator_downlevel_transformer_test.ts",
        "googmodule_test.ts",
        "jsdoc_test.ts",
        "tsickle_test.ts",
        "type-translator_test.ts",
    ],
    tsconfig = "//:tsconfig.json",
    deps = [
        ":test_support",
        "//src",
    ],
)

jasmine_node_test(
    name = "unit_test",
    srcs = [":unit_test_lib"],
)

ts_library(
    name = "e2e_test_lib",
    srcs = [
        "e2e_clutz_dts_test.ts",
        "e2e_main_test.ts",
    ],
    tsconfig = "//:tsconfig.json",
    deps = [
        ":test_support",
        "//src",
    ],
)

jasmine_node_test(
    name = "e2e_test",
    srcs = [":e2e_test_lib"],
    data = ["//:test_files"],
)

test_suite(
    name = "small_tests",
    tests = [
        ":e2e_test",
        ":unit_test",
    ],
)

ts_library(
    name = "closure_e2e_test_lib",
    srcs = [
        "closure.ts",
        "e2e_closure_test.ts",
    ],
    tsconfig = "//:tsconfig.json",
    deps = [
        ":test_support",
        "//src",
    ],
)

jasmine_node_test(
    name = "closure_e2e_test",
    srcs = [":closure_e2e_test_lib"],
    data = ["//:test_files"],
)

ts_library(
    name = "golden_test_lib",
    srcs = ["golden_tsickle_test.ts"],
    tsconfig = "//:tsconfig.json",
    deps = [
        ":test_support",
        "//src",
    ],
)

jasmine_node_test(
    name = "golden_test",
    srcs = [":golden_test_lib"],
    data = ["//:test_files"],
)
