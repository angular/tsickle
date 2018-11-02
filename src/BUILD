package(default_visibility = ["//visibility:public"])

load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "src",
    srcs = [
        "annotator_host.ts",
        "cli_support.ts",
        "decorator_downlevel_transformer.ts",
        "decorators.ts",
        "enum_transformer.ts",
        "externs.ts",
        "fileoverview_comment_transformer.ts",
        "googmodule.ts",
        "jsdoc.ts",
        "jsdoc_transformer.ts",
        "main.ts",
        "module_type_translator.ts",
        "modules_manifest.ts",
        "quoting_transformer.ts",
        "transformer_util.ts",
        "tsickle.ts",
        "type_translator.ts",
    ],
    data = ["closure_externs.js"],
    tsconfig = "//:tsconfig.json",
    deps = [],
)
