import type { GameConfig } from "#/features/game/types/game-config";
import { ITEMS } from "#/games/clairobscur/game-config/items";
import { THEME } from "#/games/clairobscur/game-config/theme";
import type { ClairObscurLocalItem } from "#/games/clairobscur/types/local-item";
import type { ClairObscurItemCategory } from "@/prisma";

const GAME_CONFIG = {
	ITEMS,
	THEME,
} satisfies GameConfig<ClairObscurLocalItem, ClairObscurItemCategory>;

export { GAME_CONFIG };
