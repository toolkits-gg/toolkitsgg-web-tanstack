import type { createSearchParamsCache } from "nuqs/server";
import type { LogoSize } from "#/components/AppLogo";
import type { GameAvatar } from "#/features/game/types/game-avatar";
import type { AppItem } from "#/features/game/item/types/app-item";
import type { ToolkitThemeDefinition } from "#/features/theme/types/toolkit-theme-definition";
import type { GameId } from "@/prisma";

type GameMetadata = {
	id: GameId;
	name: string;
	label: string;
	description: string;
	/** CloudFront-relative path to the source PNG used for favicon generation */
	faviconSourcePath: string;
	renderLogo: (size: LogoSize) => React.ReactNode;
	/** Third-party resources related to the game */
	externalResources: {
		label: string;
		link: string;
	}[];
};

type GamePages = {
	renderItemLookup: () => React.ReactNode;
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
	PAGES: GamePages;
	SEARCH_PARAMS: ReturnType<typeof createSearchParamsCache> | undefined;
	THEME: ToolkitThemeDefinition | undefined;
	AVATARS?: GameAvatar[];
};

export type { GameConfig, GameMetadata, GamePages };
