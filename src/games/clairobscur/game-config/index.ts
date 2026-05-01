import type { GameConfig } from "#/features/game/types/game-config";
import { ITEMS } from "#/games/clairobscur/game-config/items";
import { METADATA } from "#/games/clairobscur/game-config/metadata";
import { PAGES } from "#/games/clairobscur/game-config/pages";
import { THEME } from "#/games/clairobscur/game-config/theme";
import { clairObscurCollectedItemsDal } from "#/games/clairobscur/dal/collected-items";
import type { ClairObscurLocalItem } from "#/games/clairobscur/types/local-item";
import type { ClairObscurItemCategory } from "@/prisma";

const GAME_CONFIG = {
	ITEMS,
	THEME,
	METADATA,
	PAGES,
	SEARCH_PARAMS: undefined, // TODO
	DAL: { collectedItems: clairObscurCollectedItemsDal },
} satisfies GameConfig<ClairObscurLocalItem, ClairObscurItemCategory>;

export { GAME_CONFIG };
