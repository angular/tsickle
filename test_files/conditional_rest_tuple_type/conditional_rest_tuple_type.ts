function conditionalRestTupleType<T>(...args: T extends string ? [] : ['a']) {}

export const x = {
  conditionalRestTupleType<T>(...args: T extends string ? [] : ['a']) {
    conditionalRestTupleType(args as any);
  }
};
