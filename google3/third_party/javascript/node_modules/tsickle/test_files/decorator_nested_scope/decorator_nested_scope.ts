
/** @Annotation */
declare const Component: any;

class SomeService {}

export function main() {
    @Component()
    class TestComp3 {
      constructor(service: SomeService) {}
    }
}
