import { createCollectedItemsDal } from "#/features/dal/core/create-collected-items-dal";
import {
	collectItemServerFn,
	listCollectedItemsByUserIdServerFn,
	listCollectedItemsServerFn,
	uncollectItemServerFn,
} from "#/games/remnant2/dal/server/collected-items";

export const remnant2CollectedItemsDal = createCollectedItemsDal({
	entityName: "remnant2CollectedItem",
	getModel: (idb) => idb.remnant2CollectedItem,
	serverFns: {
		collectItemServerFn,
		uncollectItemServerFn,
		listCollectedItemsServerFn,
		listCollectedItemsByUserIdServerFn,
	},
});
