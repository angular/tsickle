
/** @Annotation */
declare const Component: any;

class SomeService {}

export function main() {
    
    class TestComp3 {
      constructor(service: SomeService) {}
    static decorators: {type: Function, args?: any[]}[] = [
{ type: Component },
];
/** @nocollapse */
static ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [
{type: SomeService, },
];
}
}
