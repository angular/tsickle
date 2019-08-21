package(default_visibility = ["//visibility:public"])

load("@npm_bazel_jasmine//:index.bzl", "jasmine_node_test")
load("@npm_bazel_typescript//:index.bzl", "ts_library")

ts_library(
    name = "test_support",
    srcs = ["test_support.ts"],
    testonly = True,
    tsconfig = "//:tsconfig.json",
    deps = [
        "//src",
        "@npm//@types/diff-match-patch",
        "@npm//@types/node",
        "@npm//@types/jasmine",
        "@npm//@types/glob",
        "@npm//glob",
        "@npm//typescript",
    ],
)

ts_library(
    name = "unit_test_lib",
    srcs = [
        "ast_printing_transform.ts",
        "decorator_downlevel_transformer_test.ts",
        "googmodule_test.ts",
        "jsdoc_test.ts",
        "tsickle_test.ts",
        "type_translator_test.ts",
    ],
    # Unit tests run the TS compiler, which attempts to module-resolve 'tslib'
    # when configured with --importHelpers.  So the tests must have tslib.d.ts
    # available as a runtime data dep.
    data = ["@npm//tslib"],
    testonly = True,
    tsconfig = "//:tsconfig.json",
    deps = [
        ":test_support",
        "//src",
        "@npm//@types/jasmine",
        "@npm//@types/node",
        "@npm//typescript",
    ],
)

jasmine_node_test(
    name = "unit_test",
    srcs = [":unit_test_lib"],
    deps = [
        "@npm//jasmine",
        "@npm//diff-match-patch",
        "@npm//source-map-support",
        "@npm//tslib",
    ],
)

ts_library(
    name = "e2e_test_lib",
    srcs = [
        "e2e_clutz_dts_test.ts",
        "e2e_main_test.ts",
    ],
    testonly = True,
    tsconfig = "//:tsconfig.json",
    deps = [
        ":test_support",
        "//src",
        "@npm//@types/jasmine",
        "@npm//@types/node",
        "@npm//typescript",
    ],
)

jasmine_node_test(
    name = "e2e_test",
    srcs = [":e2e_test_lib"],
    data = ["//:test_files"],
    deps = [
        "@npm//jasmine",
        "@npm//diff-match-patch",
        "@npm//minimist",
        "@npm//mkdirp",
        "@npm//source-map-support",
    ],
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
    testonly = True,
    tsconfig = "//:tsconfig.json",
    deps = [
        ":test_support",
        "//src",
        "@npm//@types/jasmine",
        "@npm//@types/node",
    ],
)

jasmine_node_test(
    name = "closure_e2e_test",
    srcs = [":closure_e2e_test_lib"],
    data = ["//:test_files"],
    deps = [
        "@npm//jasmine",
        "@npm//diff-match-patch",
        "@npm//google-closure-compiler",
        "@npm//source-map-support",
    ],
)

ts_library(
    name = "golden_test_lib",
    srcs = ["golden_tsickle_test.ts"],
    testonly = True,
    tsconfig = "//:tsconfig.json",
    deps = [
        ":test_support",
        "//src",
        "@npm//@types/jasmine",
        "@npm//@types/node",
        "@npm//typescript"
    ],
)

jasmine_node_test(
    name = "golden_test",
    srcs = [":golden_test_lib"],
    data = ["//:test_files"],
    deps = [
        "@npm//diff-match-patch",
        "@npm//jasmine",
        "@npm//source-map-support",
    ],
)
