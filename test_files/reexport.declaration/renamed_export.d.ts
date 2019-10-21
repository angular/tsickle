import { OTHER } from './export';
export { OTHER as MOTHER };
declare global {
	namespace ಠ_ಠ.clutz {
		export {OTHER as module$contents$test_files$reexport$declaration$renamed_export_MOTHER}
	}
	namespace ಠ_ಠ.clutz.module$exports$test_files$reexport$declaration$renamed_export {
		import OTHER$clutz = ಠ_ಠ.clutz.module$contents$test_files$reexport$declaration$renamed_export_MOTHER;
		export {OTHER$clutz as MOTHER};
	}
}
