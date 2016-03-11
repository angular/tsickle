// This file isn't itself a test case, but it is imported by the
// export.in.ts test case.
export * from './export_helper_2';
export let export1 = 3;
export let export2 = 3;

// TODO(evanm): this interface causes a compilation error in Closure
// due to sickle not yet transforming interfaces.
// export interface Bar { barField: number; }
// export var export3: Bar = null;
