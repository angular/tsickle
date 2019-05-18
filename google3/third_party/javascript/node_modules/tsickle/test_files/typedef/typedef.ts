type MyType = number;
var y: MyType = 3;

export type Recursive = {value: number, next: Recursive};

export type ExportedType = string;

// tsickle introduces aliases when defining local typedefs. Make sure that the typedef can still be
// used before its definition, because local typedefs are resolved to their underlying type when
// emitting types.
const useTypedefBeforeDefinition: UsedBeforeDefinition = 1;
export type UsedBeforeDefinition = number;
