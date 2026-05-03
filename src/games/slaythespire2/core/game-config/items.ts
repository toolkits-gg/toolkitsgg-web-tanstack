import type { GameConfig } from "#/features/game/core/types";
import { CARDS } from "#/games/slaythespire2/core/item-data/cards";
import { CHARACTERS } from "#/games/slaythespire2/core/item-data/characters";
import { POTIONS } from "#/games/slaythespire2/core/item-data/potions";
import { RELICS } from "#/games/slaythespire2/core/item-data/relics";
import type { SlayTheSpire2LocalItem } from "#/games/slaythespire2/core/types";
import type { SlayTheSpire2ItemCategory } from "@/prisma";

const ITEMS_BY_CATEGORY = {
	CARD: CARDS,
	CHARACTER: CHARACTERS,
	POTION: POTIONS,
	RELIC: RELICS,
} satisfies Record<SlayTheSpire2ItemCategory, SlayTheSpire2LocalItem[]>;

const allItems = Object.entries(ITEMS_BY_CATEGORY)
	.flatMap(([, items]): SlayTheSpire2LocalItem[] => items)
	.sort((a, b) => a.name.localeCompare(b.name));

const ALL_SLAYTHESPIRE2_ITEMS = allItems;

const allCategories = Object.keys(
	ITEMS_BY_CATEGORY,
) as SlayTheSpire2ItemCategory[];

// TODO: If uncollectable items or linked items are added,
// TODO: filter them out of collectable items
// TODO: See remnant2/config/items.ts for example of how to do this
const collectableItems = allItems;

const ITEMS: GameConfig<
	SlayTheSpire2LocalItem,
	SlayTheSpire2ItemCategory
>["ITEMS"] = {
	all: allItems,
	categorized: { ...ITEMS_BY_CATEGORY },
	categories: allCategories,
	uncollectableCategories: [],
	collectable: collectableItems,
};

export { ALL_SLAYTHESPIRE2_ITEMS, ITEMS };
