package(default_visibility=["//visibility:public"])
load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "src",
    srcs = [
        "class_decorator_downlevel_transformer.ts",
        "cli_support.ts",
        "decorator-annotator.ts",
        "decorators.ts",
        "es5processor.ts",
        "fileoverview_comment_transformer.ts",
        "jsdoc.ts",
        "main.ts",
        "modules_manifest.ts",
        "rewriter.ts",
        "source_map_utils.ts",
        "transformer_sourcemap.ts",
        "transformer_util.ts",
        "tsickle.ts",
        "type-translator.ts",
        "util.ts",
    ],
    deps = [],
    data = ["closure_externs.js"],
    tsconfig = "//:tsconfig.json",
)
