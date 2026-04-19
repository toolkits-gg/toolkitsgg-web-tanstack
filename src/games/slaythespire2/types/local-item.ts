import type { AppItem } from "#/features/game/item/types/app-item";
import type { SlayTheSpire2CardItem } from "#/games/slaythespire2/item-data/cards";
import type { SlayTheSpire2CharacterItem } from "#/games/slaythespire2/item-data/characters";
import type { SlayTheSpire2PotionItem } from "#/games/slaythespire2/item-data/potions";
import type { SlayTheSpire2RelicItem } from "#/games/slaythespire2/item-data/relics";
import type { SlayTheSpire2ItemLocation } from "#/games/slaythespire2/types/item-locations";
import type {
	SlayTheSpire2Character,
	SlayTheSpire2DLC,
	SlayTheSpire2ItemCategory,
} from "@/prisma";

// Placeholder until we have actual tags to use
type SlayTheSpire2InlineTags = string[];
type SlayTheSpire2CommunityTags = string[];
type SlayTheSpire2SearchableTags = string[];

type SlayTheSpire2LinkedItem = Partial<{
	character: { name: SlayTheSpire2Character };
}>;

type ItemModifiers = {
	block: number;
	blockX: number;
	channel: Array<{ type: string; amount: number }>;
	damage: number;
	damageX: number;
	dexterity: number;
	doom: number;
	draw: number;
	energy: number;
	exhaust: boolean;
	focus: number;
	gold: number;
	heal: number;
	health: number;
	intangible: number;
	poison: number;
	plating: number;
	retainHand: boolean;
	stars: number;
	strength: number;
	summon: number;
	summonPerTurn: number;
	thorns: number;
	vulnerable: number;
	weak: number;

	enemyDamage: number;
	enemyDamageX: number;
	enemyHealth: number;
	enemyStrength: number;
};

type ModifierTrigger =
	| number // number of turns
	| "attack"
	| "cards added to deck"
	| "combat start"
	| "combat"
	| "combat end"
	| "each turn"
	| "enter shop"
	| "first three turns"
	| "first time lose HP"
	| "first time play Power"
	| "next attack"
	| "permanent"
	| "shuffle draw pile";

/**
 * Shared base item type for Slay The Spire 2 items
 * Not intended to be used directly - use SlayTheSpire2Item or specific item types instead
 */
type BaseSlayTheSpire2Item<TItemSubcategory = string> = AppItem<
	SlayTheSpire2ItemCategory,
	TItemSubcategory,
	SlayTheSpire2InlineTags,
	SlayTheSpire2CommunityTags,
	SlayTheSpire2SearchableTags,
	SlayTheSpire2LinkedItem
> & {
	wikiUrl: string | undefined;
	dlc: SlayTheSpire2DLC;
	location: SlayTheSpire2ItemLocation | undefined;
	modifiers:
		| Array<{ modifier: Partial<ItemModifiers>; trigger: ModifierTrigger }>
		| undefined;
};

type SlayTheSpire2LocalItem =
	| SlayTheSpire2RelicItem
	| SlayTheSpire2CardItem
	| SlayTheSpire2PotionItem
	| SlayTheSpire2CharacterItem;

export type { BaseSlayTheSpire2Item, SlayTheSpire2LocalItem };
