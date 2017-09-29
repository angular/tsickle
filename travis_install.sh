# installs bazel so travis can build and run tests
mkdir tmp
cd tmp
BAZEL_VERSION=0.5.4
curl --location --compressed "https://github.com/bazelbuild/bazel/releases/download/$BAZEL_VERSION/bazel-$BAZEL_VERSION-installer-linux-x86_64.sh" > "bazel-$BAZEL_VERSION-installer-linux-x86_64.sh"
chmod +x "bazel-$BAZEL_VERSION-installer-linux-x86_64.sh"
"./bazel-$BAZEL_VERSION-installer-linux-x86_64.sh" --user
cd ..
rm -rf tmp
