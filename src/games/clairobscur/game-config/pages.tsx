import { AppItemPage } from "#/features/game/item/components/AppItemPage";
import type { GamePages } from "#/features/game/types/game-config";
import { ITEMS } from "#/games/clairobscur/game-config/items";
import { clairObscurCollectedItemsDal } from "#/games/clairobscur/dal/collected-items";

const PAGES: GamePages = {
	renderItemLookup: () => <AppItemPage items={ITEMS} dal={clairObscurCollectedItemsDal} />,
};

export { PAGES };
