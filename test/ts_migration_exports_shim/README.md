# goog.tsMigrationExportsShim Functional Test

This package is intended to verify that goog.tsMigrationExportsShim functions
correctly as part of an actual build. It wires together libraries in the way
users are expected to and then verifies that the build success and that types
are propagated.

The actual content for the generated files is not relevant here. There are
separate golden tests for that.
