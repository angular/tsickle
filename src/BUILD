package(default_visibility=["//visibility:public"])
load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")

# Copy the 2.4 version of typescript's typings into the project.
# We don't want to copy a file that's licensed under an external license into
# our source tree, and this mechanism allows the :src library to import it.
genrule(
    name = "typescript-2.4",
    outs = ["typescript-2.4.d.ts"],
    srcs = ["//test_ts24:node_modules/typescript/lib/typescript.d.ts"],
    # see https://docs.bazel.build/versions/master/be/general.html#genrule_args
    cmd = "cp $< $@"
)

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
        "typescript.ts",
        "util.ts",
        ":typescript-2.4.d.ts",
    ],
    deps = [],
    data = ["closure_externs.js"],
    tsconfig = "//:tsconfig.json",
)
