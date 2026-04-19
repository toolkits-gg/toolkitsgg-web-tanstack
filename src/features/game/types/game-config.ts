import type { AppItem } from "#/features/game/item/types/app-item";
import type { ToolkitThemeDefinition } from "#/features/theme/types/toolkit-theme-definition";

type GameConfig<
	TItem extends AppItem = AppItem,
	TCategory extends string | number | symbol = string,
> = {
	ITEMS: {
		all: TItem[];
		collectable: TItem[];
		categorized: Record<TCategory, TItem[]>;
		categories: TCategory[];
		uncollectableCategories: TCategory[];
	};
	THEME: ToolkitThemeDefinition | undefined;
};

export type { GameConfig };
