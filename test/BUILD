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
        "decorator-annotator_test.ts",
        "es5processor_test.ts",
        "jsdoc_test.ts",
        "source_map_test.ts",
        "source_map_utils_test.ts",
        "transformer_util_test.ts",
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
        "e2e_node_kind_source_map_test.ts",
        "e2e_source_map_test.ts",
        "e2e_test.ts",
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

ts_library(
    name = "golden_test_lib",
    srcs = [
        "golden_tsickle_test.ts",
    ],
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
