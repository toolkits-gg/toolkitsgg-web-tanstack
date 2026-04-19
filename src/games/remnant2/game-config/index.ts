import type { GameConfig } from "#/features/game/types/game-config";
import { ITEMS } from "#/games/remnant2/game-config/items";
import { THEME } from "#/games/remnant2/game-config/theme";
import type { Remnant2LocalItem } from "#/games/remnant2/types/local-item";
import type { Remnant2ItemCategory } from "@/prisma";

const GAME_CONFIG = {
	ITEMS,
	THEME,
} satisfies GameConfig<Remnant2LocalItem, Remnant2ItemCategory>;

export { GAME_CONFIG };
