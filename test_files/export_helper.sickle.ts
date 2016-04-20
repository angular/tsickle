// This file isn't itself a test case, but it is imported by the
// export.in.ts test case.
export {export3,export4} from './export_helper_2';
export let /** @type {number} */ export1 = 3;
export let /** @type {number} */ export2 = 3;

// TODO(evanm): this interface causes a compilation error in Closure
// due to sickle not yet transforming interfaces.
// export interface Bar { barField: number; }
// export var export3: Bar = null;

export let /** @type {number} */ export5 = 3;
