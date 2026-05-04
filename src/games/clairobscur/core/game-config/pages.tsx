import type { GamePages } from "#/features/game/core/types";
import { AppItemPage } from "#/features/game/items/AppItemPage";
import { resolveLinkedItems } from "#/features/game/items/utils.ts";
import { ITEMS } from "#/games/clairobscur/core/game-config/items";
import { clairObscurCollectedItemsDal } from "#/games/clairobscur/dal/collected-items";

const PAGES: GamePages = {
	renderItemLookup: () => (
		<AppItemPage
			items={ITEMS}
			resolveLinkedItems={(item) => resolveLinkedItems(item, ITEMS.all)}
			dal={clairObscurCollectedItemsDal}
		/>
	),
};

export { PAGES };
