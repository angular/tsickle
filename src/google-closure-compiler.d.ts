/// <reference path="../typings/node/node.d.ts" />
declare module 'google-closure-compiler' {
  import child_process = require('child_process');

  // The "json_streams" compiler flag lets the compiler accept/produce
  // arrays of JSON objects in this shape for input/output.
  interface JSONStreamFile {
    path: string;
    src: string;
    srcmap?: string;  // TODO(evan): pass through source maps.
  }

  type CompileOptions = {[key: string]: string[] | string | boolean};
  interface Compiler {
    run(callback: (exitCode: number, stdout: string, stderr: string) => void):
        child_process.ChildProcess;
  }
  export var compiler: {new (opts: CompileOptions): Compiler;};
}
