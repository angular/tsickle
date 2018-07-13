package(default_visibility = ["//visibility:public"])

load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")

# Copy the 2.4 version of typescript's typings into the project.
# We don't want to copy a file that's licensed under an external license into
# our source tree, and this mechanism allows the :src library to import it.
genrule(
    name = "typescript-2.4",
    srcs = ["//test_ts24:node_modules/typescript/lib/typescript.d.ts"],
    outs = ["typescript-2.4.d.ts"],
    # see https://docs.bazel.build/versions/master/be/general.html#genrule_args
    cmd = "cp $< $@",
)

ts_library(
    name = "src",
    srcs = [
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
        "type-translator.ts",
        "typescript.ts",
        ":typescript-2.4.d.ts",
    ],
    data = ["closure_externs.js"],
    tsconfig = "//:tsconfig.json",
    deps = [],
)
