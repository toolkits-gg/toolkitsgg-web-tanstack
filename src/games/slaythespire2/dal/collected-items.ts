import { createCollectedItemsDal } from "#/features/dal/core/create-collected-items-dal";
import {
	collectItemServerFn,
	listCollectedItemsServerFn,
	uncollectItemServerFn,
} from "#/games/slaythespire2/dal/server/collected-items";

export const slayTheSpire2CollectedItemsDal = createCollectedItemsDal({
	entityName: "slayTheSpire2CollectedItem",
	getModel: (idb) => idb.slayTheSpire2CollectedItem,
	serverFns: { collectItemServerFn, uncollectItemServerFn, listCollectedItemsServerFn },
});
