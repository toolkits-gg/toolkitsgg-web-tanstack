import type { GamePages } from "#/features/game/core/types";
import { AppItemPage } from "#/features/game/items/AppItemPage";
import { clairObscurCollectedItemsDal } from "#/games/clairobscur/dal/collected-items";
import { ITEMS } from "#/games/clairobscur/game-config/items";

const PAGES: GamePages = {
	renderItemLookup: () => (
		<AppItemPage items={ITEMS} dal={clairObscurCollectedItemsDal} />
	),
};

export { PAGES };
