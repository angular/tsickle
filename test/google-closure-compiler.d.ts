declare module 'google-closure-compiler' {
  type CompileOptions = {[key: string]: string[] | string | boolean};
  interface Compiler {
    run(callback: (exitCode: number, stdout: string, stderr: string) => void): void;
  }
  export var compiler: { new (opts: CompileOptions): Compiler; }
}
