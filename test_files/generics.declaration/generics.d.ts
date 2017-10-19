export declare function identity<T, U>(arg: T): U;
export interface HasThing<T> {
    thing: T;
}
export interface Lengthwise {
    length: number;
}
export declare function loggingIdentity<T extends Lengthwise>(arg: T): T;
export declare class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
}
export declare class LengthwiseContainer<T extends Lengthwise> {
    private t;
    constructor(t: T);
    incrementLength(): number;
}
export declare class DefaultGeneric<T extends {} = {}> {
}
declare global {
	namespace ಠ_ಠ.clutz {
		const module$contents$test_files$generics$declaration$generics_identity: typeof identity;
		type module$contents$test_files$generics$declaration$generics_HasThing<T> = HasThing<T>;
		type module$contents$test_files$generics$declaration$generics_Lengthwise = Lengthwise;
		const module$contents$test_files$generics$declaration$generics_loggingIdentity: typeof loggingIdentity;
		type module$contents$test_files$generics$declaration$generics_GenericNumber<T> = GenericNumber<T>;
		const module$contents$test_files$generics$declaration$generics_GenericNumber: typeof GenericNumber;
		type module$contents$test_files$generics$declaration$generics_GenericNumber_Instance<T> = GenericNumber<T>;
		const module$contents$test_files$generics$declaration$generics_GenericNumber_Instance: typeof GenericNumber;
		type module$contents$test_files$generics$declaration$generics_LengthwiseContainer<T extends Lengthwise> = LengthwiseContainer<T>;
		const module$contents$test_files$generics$declaration$generics_LengthwiseContainer: typeof LengthwiseContainer;
		type module$contents$test_files$generics$declaration$generics_LengthwiseContainer_Instance<T extends Lengthwise> = LengthwiseContainer<T>;
		const module$contents$test_files$generics$declaration$generics_LengthwiseContainer_Instance: typeof LengthwiseContainer;
		type module$contents$test_files$generics$declaration$generics_DefaultGeneric<T extends {} = {}> = DefaultGeneric<T>;
		const module$contents$test_files$generics$declaration$generics_DefaultGeneric: typeof DefaultGeneric;
		type module$contents$test_files$generics$declaration$generics_DefaultGeneric_Instance<T extends {} = {}> = DefaultGeneric<T>;
		const module$contents$test_files$generics$declaration$generics_DefaultGeneric_Instance: typeof DefaultGeneric;
	}
}
