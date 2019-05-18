function toPromise(ctorLike: PromiseConstructorLike): Promise<string> {
  return new ctorLike((resolve, reject) => {
    reject('grumpycat');
  }) as Promise<string>;
}
