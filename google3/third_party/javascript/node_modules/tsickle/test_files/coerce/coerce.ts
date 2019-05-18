function acceptString(arg: string): string { return arg; }
acceptString(<any>3);
acceptString(3 as any);
acceptString(`${3 as any}`);

const nullableVariable: string|null = 'asd';
const nonNullVariable: string = nullableVariable!;
