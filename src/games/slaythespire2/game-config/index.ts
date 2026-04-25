import type { GameConfig } from "#/features/game/types/game-config";
import { ITEMS } from "#/games/slaythespire2/game-config/items";
import { METADATA } from "#/games/slaythespire2/game-config/metadata";
import { PAGES } from "#/games/slaythespire2/game-config/pages";
import { THEME } from "#/games/slaythespire2/game-config/theme";
import type { SlayTheSpire2LocalItem } from "#/games/slaythespire2/types/local-item";
import type { SlayTheSpire2ItemCategory } from "@/prisma";

const GAME_CONFIG = {
	ITEMS,
	THEME,
	METADATA,
	PAGES,
} satisfies GameConfig<SlayTheSpire2LocalItem, SlayTheSpire2ItemCategory>;

export { GAME_CONFIG };
