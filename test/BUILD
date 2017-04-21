package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "test",
    srcs = glob(["*.ts"]),
    deps = ["//src"],
    tsconfig = "//:tsconfig.json",
    testonly = 1,
)
