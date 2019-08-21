export {};

async function asyncTopLevelFunction(param: string): Promise<string> {
  const p = new Promise<string>((res, rej) => {
    res(param);
  });
  const s = await p;
  return s;
}

async function asyncTopLevelFunctionWithThisType(this: Container, param: string): Promise<string> {
  const p = new Promise<string>((res, rej) => {
    res(param);
  });
  const s = await p;
  return s + this.field;
}

const asyncTopLevelArrowFunction = async(param: string): Promise<string> => {
  const p = new Promise<string>((res, rej) => {
    res(param);
  });
  const s = await p;
  return s + this.field;
};

class Container {
  field = 'y';

  async asyncMethod() {
    const s = await asyncTopLevelFunction('x');
    return s + this.field;
  }

  containerMethod() {
    const asyncArrowFunctionInMethod = async(param: string): Promise<string> => {
      const p = new Promise<string>((res, rej) => {
        res(param);
      });
      const s = await p;
      return s + this.field;
    };
    async function asyncFunctionInMethod(param: string): Promise<string> {
      const p = new Promise<string>((res, rej) => {
        res(param);
      });
      const s = await p;
      return s + this.field;
    }
  }
}
