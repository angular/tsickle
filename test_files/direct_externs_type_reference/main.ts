import {returnsClutz2DtsImportedType, returnsClutzDtsImportedType, returnsLiteralDtsImportedType, returnsString, returnsTsickleDtsImportedType} from './lib';

const inferredAsLiteralType = returnsString('some string');

const inferredAsExternType = returnsLiteralDtsImportedType('some string');

const inferredAsImportedClutzType = returnsClutzDtsImportedType('some string');

const inferredAsImportedClutz2Type =
    returnsClutz2DtsImportedType('some string');

const inferredAsImportedTsickleType =
    returnsTsickleDtsImportedType('some string');
