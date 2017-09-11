import * as ts from 'typescript';

/**
 * Creates a transformer that captures the state of the AST as pretty printed
 * TypeScript in the provided 'files' map.
 */
export function createAstPrintingTransform(files: Map<string, string>) {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (node: ts.SourceFile): ts.SourceFile => {
      const sf = node as ts.SourceFile;
      files.set(sf.fileName, ts.createPrinter().printFile(sf));
      return sf;
    };
  };
}