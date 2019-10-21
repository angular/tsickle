export declare const NUM_CONSTANT = 3;
export declare const OTHER = 1;
declare const NON_DIRECT = 0;
export { NON_DIRECT };
declare const NON_DIRECT_TO_BE_RENAMED = 0;
export { NON_DIRECT_TO_BE_RENAMED as NEW_NAME };
declare global {
	namespace ಠ_ಠ.clutz {
		export {NON_DIRECT_TO_BE_RENAMED as module$contents$test_files$reexport$declaration$export_NEW_NAME}
		export {NON_DIRECT as module$contents$test_files$reexport$declaration$export_NON_DIRECT}
		export {NUM_CONSTANT as module$contents$test_files$reexport$declaration$export_NUM_CONSTANT}
		export {OTHER as module$contents$test_files$reexport$declaration$export_OTHER}
	}
	namespace ಠ_ಠ.clutz.module$exports$test_files$reexport$declaration$export {
		import NON_DIRECT_TO_BE_RENAMED$clutz = ಠ_ಠ.clutz.module$contents$test_files$reexport$declaration$export_NEW_NAME;
		export {NON_DIRECT_TO_BE_RENAMED$clutz as NEW_NAME};
		import NON_DIRECT$clutz = ಠ_ಠ.clutz.module$contents$test_files$reexport$declaration$export_NON_DIRECT;
		export {NON_DIRECT$clutz as NON_DIRECT};
		import NUM_CONSTANT$clutz = ಠ_ಠ.clutz.module$contents$test_files$reexport$declaration$export_NUM_CONSTANT;
		export {NUM_CONSTANT$clutz as NUM_CONSTANT};
		import OTHER$clutz = ಠ_ಠ.clutz.module$contents$test_files$reexport$declaration$export_OTHER;
		export {OTHER$clutz as OTHER};
	}
}
