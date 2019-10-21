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
		export {DefaultGeneric as module$contents$test_files$generics$declaration$generics_DefaultGeneric}
		export {GenericNumber as module$contents$test_files$generics$declaration$generics_GenericNumber}
		export {HasThing as module$contents$test_files$generics$declaration$generics_HasThing}
		export {Lengthwise as module$contents$test_files$generics$declaration$generics_Lengthwise}
		export {LengthwiseContainer as module$contents$test_files$generics$declaration$generics_LengthwiseContainer}
		export {identity as module$contents$test_files$generics$declaration$generics_identity}
		export {loggingIdentity as module$contents$test_files$generics$declaration$generics_loggingIdentity}
	}
	namespace ಠ_ಠ.clutz.module$exports$test_files$generics$declaration$generics {
		import DefaultGeneric$clutz = ಠ_ಠ.clutz.module$contents$test_files$generics$declaration$generics_DefaultGeneric;
		export {DefaultGeneric$clutz as DefaultGeneric};
		import GenericNumber$clutz = ಠ_ಠ.clutz.module$contents$test_files$generics$declaration$generics_GenericNumber;
		export {GenericNumber$clutz as GenericNumber};
		import HasThing$clutz = ಠ_ಠ.clutz.module$contents$test_files$generics$declaration$generics_HasThing;
		export {HasThing$clutz as HasThing};
		import Lengthwise$clutz = ಠ_ಠ.clutz.module$contents$test_files$generics$declaration$generics_Lengthwise;
		export {Lengthwise$clutz as Lengthwise};
		import LengthwiseContainer$clutz = ಠ_ಠ.clutz.module$contents$test_files$generics$declaration$generics_LengthwiseContainer;
		export {LengthwiseContainer$clutz as LengthwiseContainer};
		import identity$clutz = ಠ_ಠ.clutz.module$contents$test_files$generics$declaration$generics_identity;
		export {identity$clutz as identity};
		import loggingIdentity$clutz = ಠ_ಠ.clutz.module$contents$test_files$generics$declaration$generics_loggingIdentity;
		export {loggingIdentity$clutz as loggingIdentity};
	}
}
