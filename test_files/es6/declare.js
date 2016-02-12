var DeclareTestIncluded;
(function (DeclareTestIncluded) {
    // This enum should produce statements, as it's not a "declare".
    var FileType;
    (function (FileType) {
        FileType[FileType["VALID"] = 1] = "VALID";
    })(FileType || (FileType = {}));
    /** @type {FileType} */
    FileType.VALID = 1;
})(DeclareTestIncluded || (DeclareTestIncluded = {}));
