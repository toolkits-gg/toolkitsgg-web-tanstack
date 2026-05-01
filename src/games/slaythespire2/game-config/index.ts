import type { GameConfig } from "#/features/game/types/game-config";
import { AVATARS } from "#/games/slaythespire2/game-config/avatars";
import { ITEMS } from "#/games/slaythespire2/game-config/items";
import { METADATA } from "#/games/slaythespire2/game-config/metadata";
import { PAGES } from "#/games/slaythespire2/game-config/pages";
import { SEARCH_PARAMS } from "#/games/slaythespire2/game-config/search-params";
import { THEME } from "#/games/slaythespire2/game-config/theme";
import { slayTheSpire2CollectedItemsDal } from "#/games/slaythespire2/dal/collected-items";
import type { SlayTheSpire2LocalItem } from "#/games/slaythespire2/types/local-item";
import type { SlayTheSpire2ItemCategory } from "@/prisma";

const GAME_CONFIG = {
	ITEMS,
	THEME,
	METADATA,
	PAGES,
	SEARCH_PARAMS,
	AVATARS,
	DAL: { collectedItems: slayTheSpire2CollectedItemsDal },
} satisfies GameConfig<SlayTheSpire2LocalItem, SlayTheSpire2ItemCategory>;

export { GAME_CONFIG };
