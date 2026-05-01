import { MultiSelect, Stack, Text } from "@mantine/core";
import { parseAsString } from "nuqs";
import type { ReactNode } from "react";
import { AppItemPage } from "#/features/game/item/components/AppItemPage";
import type { AppItem } from "#/features/game/item/types/app-item";
import type { GameFilterConfig } from "#/features/game/item/types/game-filter-config";
import {
	formatCategoryLabel,
	itemMatchesCategory,
} from "#/features/game/item/utils/filter-helpers";
import { getItemSubcategories } from "#/features/game/item/utils/get-item-subcategories";
import type { GamePages } from "#/features/game/types/game-config";
import { slayTheSpire2CollectedItemsDal } from "#/games/slaythespire2/dal/collected-items";
import { ITEMS } from "#/games/slaythespire2/game-config/items";

const slayTheSpire2FilterConfig: GameFilterConfig = {
	label: "Slay the Spire 2 Filters",
	parsers: {
		category: parseAsString.withDefault(""),
	},
	defs: [
		{
			key: "category",
			label: "Categories",
			defaultValue: "",
			serialize: (v) => v || undefined,
			formatValue: formatCategoryLabel,
		},
	],
	renderControls: (
		params: Record<string, string>,
		setParam: (key: string, value: string | undefined) => void,
		_filteredItems: AppItem[],
	): ReactNode => {
		const categoryRaw = params.category ?? "";
		const selectedCategories = categoryRaw ? categoryRaw.split(",") : [];
		const groupedSubcategories = getItemSubcategories(ITEMS.all);

		return (
			<Stack gap="xs">
				<Text fz="sm" fw={500} c="dimmed">
					Slay the Spire 2 Filters
				</Text>
				<MultiSelect
					label="Categories"
					placeholder="Select categories"
					data={groupedSubcategories}
					value={selectedCategories}
					onChange={(val) =>
						setParam("category", val.length > 0 ? val.join(",") : undefined)
					}
				/>
			</Stack>
		);
	},
	filterItems: (
		items: AppItem[],
		params: Record<string, string>,
	): AppItem[] => {
		const categoryRaw = params.category ?? "";
		const selectedCategories = categoryRaw
			? categoryRaw.split(",").filter(Boolean)
			: [];

		if (selectedCategories.length === 0) return items;

		return items.filter((item) =>
			selectedCategories.some((f) => itemMatchesCategory(item, f)),
		);
	},
};

const PAGES: GamePages = {
	renderItemLookup: () => (
		<AppItemPage items={ITEMS} dal={slayTheSpire2CollectedItemsDal} gameFilterConfig={slayTheSpire2FilterConfig} />
	),
};

export { PAGES };
