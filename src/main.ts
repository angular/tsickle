import {annotate, compilerOptions, formatDiagnostics} from './sickle';
import * as ts from 'typescript';

// CLI entry point
if (require.main === module) {
  let paths = process.argv.splice(2);
  let program = ts.createProgram(paths, compilerOptions);
  let diags = ts.getPreEmitDiagnostics(program);
  if (diags.length > 0) {
    console.log(formatDiagnostics(diags));
    process.exit(1);
  }
  for (let path of paths) {
    console.log(annotate(program, program.getSourceFile(path)));
  }
}
