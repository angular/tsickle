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
		type module$contents$test_files$generics$declaration$generics_GenericNumber_Instance<T> = GenericNumber<T>;
		const module$contents$test_files$generics$declaration$generics_GenericNumber: typeof GenericNumber;
		const module$contents$test_files$generics$declaration$generics_GenericNumber_Instance: typeof GenericNumber;
		type module$contents$test_files$generics$declaration$generics_LengthwiseContainer<T extends Lengthwise> = LengthwiseContainer<T>;
		type module$contents$test_files$generics$declaration$generics_LengthwiseContainer_Instance<T extends Lengthwise> = LengthwiseContainer<T>;
		const module$contents$test_files$generics$declaration$generics_LengthwiseContainer: typeof LengthwiseContainer;
		const module$contents$test_files$generics$declaration$generics_LengthwiseContainer_Instance: typeof LengthwiseContainer;
		type module$contents$test_files$generics$declaration$generics_DefaultGeneric<T extends {} = {}> = DefaultGeneric<T>;
		type module$contents$test_files$generics$declaration$generics_DefaultGeneric_Instance<T extends {} = {}> = DefaultGeneric<T>;
		const module$contents$test_files$generics$declaration$generics_DefaultGeneric: typeof DefaultGeneric;
		const module$contents$test_files$generics$declaration$generics_DefaultGeneric_Instance: typeof DefaultGeneric;
	}
	namespace ಠ_ಠ.clutz.module$exports$test_files$generics$declaration$generics {
		const identity: typeof module$contents$test_files$generics$declaration$generics_identity;
		type HasThing<T> = module$contents$test_files$generics$declaration$generics_HasThing<T>;
		type Lengthwise = module$contents$test_files$generics$declaration$generics_Lengthwise;
		const loggingIdentity: typeof module$contents$test_files$generics$declaration$generics_loggingIdentity;
		type GenericNumber<T> = module$contents$test_files$generics$declaration$generics_GenericNumber<T>;
		type GenericNumber_Instance<T> = module$contents$test_files$generics$declaration$generics_GenericNumber<T>;
		const GenericNumber: typeof module$contents$test_files$generics$declaration$generics_GenericNumber;
		const GenericNumber_Instance: typeof module$contents$test_files$generics$declaration$generics_GenericNumber;
		type LengthwiseContainer<T extends Lengthwise> = module$contents$test_files$generics$declaration$generics_LengthwiseContainer<T>;
		type LengthwiseContainer_Instance<T extends Lengthwise> = module$contents$test_files$generics$declaration$generics_LengthwiseContainer<T>;
		const LengthwiseContainer: typeof module$contents$test_files$generics$declaration$generics_LengthwiseContainer;
		const LengthwiseContainer_Instance: typeof module$contents$test_files$generics$declaration$generics_LengthwiseContainer;
		type DefaultGeneric<T extends {} = {}> = module$contents$test_files$generics$declaration$generics_DefaultGeneric<T>;
		type DefaultGeneric_Instance<T extends {} = {}> = module$contents$test_files$generics$declaration$generics_DefaultGeneric<T>;
		const DefaultGeneric: typeof module$contents$test_files$generics$declaration$generics_DefaultGeneric;
		const DefaultGeneric_Instance: typeof module$contents$test_files$generics$declaration$generics_DefaultGeneric;
	}
}
