export declare const x = 1;
declare global {
	namespace ಠ_ಠ.clutz {
		export {x as module$contents$test_files$nested_folder$declaration$inner_folder$nested_x}
	}
	namespace ಠ_ಠ.clutz.module$exports$test_files$nested_folder$declaration$inner_folder$nested {
		import x$clutz = ಠ_ಠ.clutz.module$contents$test_files$nested_folder$declaration$inner_folder$nested_x;
		export {x$clutz as x};
	}
}
