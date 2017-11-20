type MyType = number;
var y: MyType = 3;

type Recursive = {value: number, next: Recursive};

// TypeScript expands union members when constructing, which drops the
// distinction in unionUserInUnion between string|number|boolean and
// UnionTypeAlias|boolean. That's a problem if the constituent types are not
// valid symbols in the lexical context (e.g. not imported).

type UnionTypeAlias = string|number;
const unionUser: UnionTypeAlias = 1;
const unionUserInUnion: UnionTypeAlias|boolean = false;
type UnionTypeAliasUsingUnion = {x: UnionTypeAlias|boolean};
function paramUsingUnion(x: UnionTypeAlias|boolean) {}

export type ExportedType = string;

interface TypeWithGenericArgAndDefault<T, U=UnionTypeAlias> {}
type TypeAliasWithDefaultArgs = TypeWithGenericArgAndDefault<number>;

interface TypeWithGenericArg<T> {}
type TypeAliasWithTypeArgs<T> = TypeWithGenericArg<T>;
