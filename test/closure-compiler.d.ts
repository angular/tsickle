declare module 'closure-compiler' {
  type Callback = (err: Error, stdout: string, stderr: string) => void;
  function compile(src: string, options?: {[k: string]: string | string[]} | Callback,
                   callback?: Callback): void;
}