export declare const x = 1;
export declare function incr(n: any): number;
declare global {
	namespace ಠ_ಠ.clutz {
		const module$contents$test_files$basic$declaration$basic_x: typeof x;
		const module$contents$test_files$basic$declaration$basic_incr: typeof incr;
	}
	namespace ಠ_ಠ.clutz.module$exports$test_files$basic$declaration$basic {
		const x: typeof module$contents$test_files$basic$declaration$basic_x;
		const incr: typeof module$contents$test_files$basic$declaration$basic_incr;
	}
}
