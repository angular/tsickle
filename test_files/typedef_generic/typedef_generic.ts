type UnionTypeAlias = string|number;
interface TypeWithGenericArgAndDefault<T, U=UnionTypeAlias> {}
type TypeAliasWithDefaultArgs = TypeWithGenericArgAndDefault<number>;

interface TypeWithGenericArg<T> {}
type TypeAliasWithTypeArgs<T> = TypeWithGenericArg<T>;

// Repro to ensure we pass on the syntactical type node (TypeAliasWithTypeArgs)
// through a two-level generic type argument.
const varUsingArrayOfGenericAlias: TypeAliasWithTypeArgs<string>[] = [];
