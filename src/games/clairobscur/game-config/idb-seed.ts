import type { GameIDBSeed } from "#/features/game/core/types";
import { ITEMS } from "#/games/clairobscur/game-config/items";
import { getIDBClient } from "#/integrations/prisma-idb/idb-client";

const clairObscurIDBSeed: GameIDBSeed = {
	seedFlag: "idb-seeded-clairobscur",
	seed: async () => {
		const idb = await getIDBClient();

		const existingCount = await idb.clairObscurItem.count();
		if (existingCount === 0) {
			await idb.clairObscurItem.createMany({
				data: ITEMS.collectable.map((item) => ({
					slug: item.id,
					name: item.name,
					category: item.category,
					disabled: false,
				})),
			});
		}
	},
};

export { clairObscurIDBSeed };
