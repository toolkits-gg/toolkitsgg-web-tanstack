import { MultiSelect, Stack, Text } from "@mantine/core";
import { parseAsString } from "nuqs";
import type { ReactNode } from "react";
import { AppItemPage } from "#/features/game/item/components/AppItemPage";
import type { AppItem } from "#/features/game/item/types/app-item";
import type { GameFilterConfig } from "#/features/game/item/types/game-filter-config";
import { getItemSubcategories } from "#/features/game/item/utils/get-item-subcategories";
import type { GamePages } from "#/features/game/types/game-config";
import { ITEMS } from "#/games/slaythespire2/game-config/items";

function formatCategoryLabel(raw: string): string {
	const selected = raw ? raw.split(",").filter(Boolean) : [];
	if (selected.length === 0) return "";
	if (selected.length === 1) {
		const val = selected[0] ?? "";
		if (val.includes(":")) {
			const [cat, sub] = val.split(":");
			return `${titleCase(sub ?? "")} ${titleCase(cat ?? "")}`;
		}
		return titleCase(val);
	}
	return `${selected.length} selected`;
}

function titleCase(str: string): string {
	return str
		.split(/[_ ]/)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(" ");
}

function itemMatchesCategory(item: AppItem, filterValue: string): boolean {
	if (filterValue.includes(":")) {
		const [category, subcategory] = filterValue.split(":");
		if (String(item.category) !== category) return false;
		return (
			item.subcategory !== undefined && String(item.subcategory) === subcategory
		);
	}
	return String(item.category) === filterValue;
}

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
		<AppItemPage items={ITEMS} gameFilterConfig={slayTheSpire2FilterConfig} />
	),
};

export { PAGES };
