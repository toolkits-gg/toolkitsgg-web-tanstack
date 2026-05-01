import { createCollectedItemsDal } from "#/features/dal/core/create-collected-items-dal";
import {
	collectItemServerFn,
	listCollectedItemsServerFn,
	uncollectItemServerFn,
} from "#/games/clairobscur/dal/server/collected-items";

export const clairObscurCollectedItemsDal = createCollectedItemsDal({
	entityName: "clairObscurCollectedItem",
	getModel: (idb) => idb.clairObscurCollectedItem,
	serverFns: { collectItemServerFn, uncollectItemServerFn, listCollectedItemsServerFn },
});
