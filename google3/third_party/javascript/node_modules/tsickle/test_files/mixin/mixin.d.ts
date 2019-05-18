declare function MyMixin<T extends new (...args: any[]) => {}>(base: T):
    T & MixinConstructor;

interface MixinConstructor {
  new(...args: any[]): MyMixin;
}

interface MyMixin {
  mixinProp: string;
}

declare class MyClass extends MyMixin(HTMLElement) {
  classProp: string;
}
