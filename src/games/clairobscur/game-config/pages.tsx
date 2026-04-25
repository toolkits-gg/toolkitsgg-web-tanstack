import { AppItemPage } from "#/features/game/item/components/AppItemPage";
import type { GamePages } from "#/features/game/types/game-config";
import { ITEMS } from "#/games/clairobscur/game-config/items";

const PAGES: GamePages = {
	renderItemLookup: () => <AppItemPage items={ITEMS} />,
};

export { PAGES };
