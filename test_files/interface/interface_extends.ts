interface ParentInterface {
  x: number;
}

interface SubType extends ParentInterface {
  y: number;
}

interface SubMulti extends ParentInterface, SubType {
  z: number;
}

declare namespace aNamespace {
  function aFunction(): void;
}
type ANamespace = typeof aNamespace;
interface InterfaceExtendsNamespace extends ANamespace {}
