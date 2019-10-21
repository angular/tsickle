export declare const x = 1;
export declare function incr(n: any): number;
export declare const y = 1;
declare global {
	namespace ಠ_ಠ.clutz {
		export {incr as module$contents$test_files$basic$declaration$basic_incr}
		export {x as module$contents$test_files$basic$declaration$basic_x}
		export {y as module$contents$test_files$basic$declaration$basic_y}
	}
	namespace ಠ_ಠ.clutz.module$exports$test_files$basic$declaration$basic {
		import incr$clutz = ಠ_ಠ.clutz.module$contents$test_files$basic$declaration$basic_incr;
		export {incr$clutz as incr};
		import x$clutz = ಠ_ಠ.clutz.module$contents$test_files$basic$declaration$basic_x;
		export {x$clutz as x};
		import y$clutz = ಠ_ಠ.clutz.module$contents$test_files$basic$declaration$basic_y;
		export {y$clutz as y};
	}
}
