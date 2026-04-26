import type { GameDBSeed } from "#/features/game/types/game-seeds";
import { clairObscurDBSeed } from "#/games/clairobscur/game-config/db-seed";
import { remnant2DBSeed } from "#/games/remnant2/game-config/db-seed";
import { slayTheSpire2DBSeed } from "#/games/slaythespire2/game-config/db-seed";
import type { GameId } from "@/prisma";

const allGameDBSeeds: Record<Exclude<GameId, "none">, GameDBSeed> = {
	clairobscur: clairObscurDBSeed,
	remnant2: remnant2DBSeed,
	slaythespire2: slayTheSpire2DBSeed,
};

export { allGameDBSeeds };
