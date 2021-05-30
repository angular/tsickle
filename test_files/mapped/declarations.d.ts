declare namespace Mapped {
  interface SomeProperties {
    color: 'red'|'green'|'blue';
  }

  type PartialProperties = Partial<SomeProperties>;
}
