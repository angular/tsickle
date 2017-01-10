import * as ts from 'typescript';
import * as tsickle from './tsickle';
import {SourceMapConsumer, SourceMapGenerator} from 'source-map';
import * as path from 'path';
import * as cliSupport from './cli_support';

export class TsickleCompilerHost implements ts.CompilerHost {
    delegate: ts.CompilerHost;
    program: ts.Program;
    tsickleOptions: tsickle.Options;
    tsickleSourceMaps: Map<string, SourceMapGenerator>;
    tsickleExterns: string;
    outputFiles: Map<string, string>;

    fileExists: (fileName: string) => boolean;
    readFile: (fileName: string) => string;
    trace: ((s: string) => void) | undefined;
    directoryExists: ((directoryName: string) => boolean) | undefined;
    realpath: ((path: string) => string) | undefined;
    getCurrentDirectory: () => string;
    getDirectories: (path: string) => string[];

    getSourceFileByPath: ((fileName: string, path: ts.Path, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => ts.SourceFile) | undefined;
    getCancellationToken: (() => ts.CancellationToken) | undefined;
    getDefaultLibFileName: (options: ts.CompilerOptions) => string;
    getDefaultLibLocation: (() => string) | undefined;
    getCanonicalFileName: (fileName: string) => string;
    useCaseSensitiveFileNames: () => boolean;
    getNewLine: () => string;
    resolveModuleNames: ((moduleNames: string[], containingFile: string) => ts.ResolvedModule[]) | undefined;
    /**
     * This method is a companion for 'resolveModuleNames' and is used to resolve 'types' references to actual type declaration files
     */
    resolveTypeReferenceDirectives: ((typeReferenceDirectiveNames: string[], containingFile: string) => ts.ResolvedTypeReferenceDirective[]) | undefined;


    constructor(delegate: ts.CompilerHost, program: ts.Program, tsickleOptions: tsickle.Options) {
        this.delegate = delegate;
        this.program = program;
        this.tsickleOptions = tsickleOptions;
        this.tsickleSourceMaps = new Map<string, SourceMapGenerator>();
        this.tsickleExterns = '';
        this.outputFiles = new Map<string, string>();

        this.getSourceFileByPath = this.delegate.getSourceFileByPath;
        this.getCancellationToken = this.delegate.getCancellationToken;
        this.getDefaultLibFileName = this.delegate.getDefaultLibFileName;
        this.getDefaultLibLocation = this.delegate.getDefaultLibLocation;
        this.getCurrentDirectory = this.delegate.getCurrentDirectory;
        this.getDirectories = this.delegate.getDirectories;
        this.getCanonicalFileName = this.delegate.getCanonicalFileName;
        this.useCaseSensitiveFileNames = this.delegate.useCaseSensitiveFileNames;
        this.getNewLine = this.delegate.getNewLine;
        this.resolveModuleNames = this.delegate.resolveModuleNames;
        this.resolveTypeReferenceDirectives = this.delegate.resolveTypeReferenceDirectives;

        this.fileExists = this.delegate.fileExists;
        this.readFile = this.delegate.readFile;
        this.trace = this.delegate.trace;
        this.directoryExists = this.delegate.directoryExists;
        this.realpath = this.delegate.realpath;
    }

    getExterns(): string {
        return this.tsickleExterns;
    }

    getOutputFiles(): Map<string, string> {
        return this.outputFiles;
    }

    getSourceFile(fileName: string, languageVersion: ts.ScriptTarget,
    onError?: (message: string) => void): ts.SourceFile {
        const {output, externs, diagnostics, sourceMap} =
            tsickle.annotate(this.program, this.program.getSourceFile(fileName), this.tsickleOptions);
        if (diagnostics.length > 0) {
            // throw new Exception('there were diagnostics!');
        }

        this.tsickleSourceMaps.set(fileName, sourceMap);

        if (externs) {
            this.tsickleExterns += externs;
        }

        return ts.createSourceFile(fileName, output, languageVersion);
    }



    writeFile(fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]): void {
        if (path.extname(fileName) !== '.map') {
            const moduleId = fileName;  // TODO: does anyone use this?
            let {output} = tsickle.processES5(
                fileName, moduleId, data, cliSupport.pathToModuleName);
            this.outputFiles.set(fileName, output);
        } else {
            const tscSourceMapJson: any = data;
            const tscSourceMap = new SourceMapConsumer(tscSourceMapJson);
            const tscSourceMapGenerator = SourceMapGenerator.fromSourceMap(tscSourceMap);

            for (const sourceFileName of (new SourceMapConsumer(tscSourceMapJson) as any).sources) {
                const tsickleSourceMapGenerator = this.tsickleSourceMaps.get(sourceFileName)!;
                const tsickleRawSourceMap = tsickleSourceMapGenerator.toJSON();
                tsickleRawSourceMap.sources[0] = sourceFileName;
                tsickleRawSourceMap.file = sourceFileName;

                const tsickleSourceMap = new SourceMapConsumer(tsickleRawSourceMap);

                tscSourceMapGenerator.applySourceMap(tsickleSourceMap);
            }
            this.outputFiles.set(fileName, tscSourceMapGenerator.toString());
        }
    }

    /**
     * This method is a companion for 'resolveModuleNames' and is used to resolve 'types' references to actual type declaration files
     */
}