import type { GameIDBSeed } from "#/features/game/core/types";
import { clairObscurIDBSeed } from "#/games/clairobscur/game-config/idb-seed";
import { remnant2IDBSeed } from "#/games/remnant2/core/game-config/idb-seed";
import { slayTheSpire2IDBSeed } from "#/games/slaythespire2/core/game-config/idb-seed";
import type { GameId } from "@/prisma";

const allGameIDBSeeds: Record<Exclude<GameId, "none">, GameIDBSeed> = {
	clairobscur: clairObscurIDBSeed,
	remnant2: remnant2IDBSeed,
	slaythespire2: slayTheSpire2IDBSeed,
};

export { allGameIDBSeeds };
