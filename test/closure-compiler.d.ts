declare module 'closure-compiler' {
  export interface CompileOptions { [k: string]: boolean | string | string[]; }
  type Callback = (err: Error, stdout: string, stderr: string) => void;
  function compile(src: string, options?: CompileOptions | Callback, callback?: Callback): void;
}
