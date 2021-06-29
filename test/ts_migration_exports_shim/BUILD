load("//javascript/typescript:build_defs.bzl", "ts_library")
load("//tools/build_defs/js:rules.bzl", "js_library")
load("//tools/build_rules:build_test.bzl", "build_test")

licenses(["notice"])

build_test(
    name = "integration_test",
    targets = [
        ":goog_module_ref",
        ":goog_colon_and_clutz_ref",
    ],
)

ts_library(
    name = "goog_colon_and_clutz_ref",
    srcs = ["goog_colon_and_clutz_ref.ts"],
    deps = [
        ":goog_module_ref",
        ":migrated",
    ],
)

js_library(
    name = "goog_module_ref",
    srcs = [
        "goog_module_ref.js",
    ],
    deps = [
        ":migrated",
        "//javascript/closure:base",
    ],
)

ts_library(
    name = "migrated",
    srcs = [
        "migrated_default_shorthand.ts",
        "migrated_default_type.ts",
        "migrated_default_value.ts",
        "migrated_named.ts",
        "migrated_named_shorthand.ts",
    ],
    generate_ts_migration_exports_shim = True,
)
