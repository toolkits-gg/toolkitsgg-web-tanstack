import type { SingleParserBuilder } from "nuqs";
import type { ReactNode } from "react";
import type { AppItem } from "#/features/game/item/types/app-item";

type GameFilterDef = {
	key: string;
	label: string;
	defaultValue: string;
	serialize: (value: string) => string | undefined;
	formatValue?: (raw: string) => string;
};

type GameFilterConfig = {
	label: string;
	defs: GameFilterDef[];
	parsers: Record<string, SingleParserBuilder<string>>;
	renderControls: (
		params: Record<string, string>,
		setParam: (key: string, value: string | undefined) => void,
		filteredItems: AppItem[],
	) => ReactNode;
	filterItems: (items: AppItem[], params: Record<string, string>) => AppItem[];
};

export type { GameFilterConfig, GameFilterDef };
