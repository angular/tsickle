interface Foo {
  // Not all signatures have a this parameter. Should still generate proper
  // jsdoc.
  bar(this: Foo, x: boolean, y: number): boolean;
  bar(this: void, x: string): string;
  bar(x?: number): any[];
}
