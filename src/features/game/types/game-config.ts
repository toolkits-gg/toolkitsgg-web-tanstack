import type { LogoSize } from "#/components/AppLogo";
import type { AppItem } from "#/features/game/item/types/app-item";
import type { ToolkitThemeDefinition } from "#/features/theme/types/toolkit-theme-definition";
import type { GameId } from "@/prisma";

type GameMetadata = {
	id: GameId;
	name: string;
	label: string;
	description: string;
	renderLogo: (size: LogoSize) => React.ReactNode;
	/** Third-party resources related to the game */
	externalResources: {
		label: string;
		link: string;
	}[];
};

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
	METADATA: GameMetadata;
	THEME: ToolkitThemeDefinition | undefined;
};

export type { GameConfig, GameMetadata };
