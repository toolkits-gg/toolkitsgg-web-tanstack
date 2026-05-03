import { upperFirst } from "@mantine/hooks";
import type { AppItem } from "#/features/game/items/types";

/** Formats a comma-separated category filter value (or "cat:sub") into a human-readable label. */
const formatCategoryLabel = (raw: string): string => {
	const selected = raw ? raw.split(",").filter(Boolean) : [];
	if (selected.length === 0) return "";
	if (selected.length === 1) {
		const val = selected[0] ?? "";
		if (val.includes(":")) {
			const [cat, sub] = val.split(":");
			return `${upperFirst(sub ?? "")} ${upperFirst(cat ?? "")}`;
		}
		return upperFirst(val);
	}
	return `${selected.length} selected`;
};

/** Returns true if the item's category (and optional subcategory) matches the filter value. */
const itemMatchesCategory = (item: AppItem, filterValue: string): boolean => {
	if (filterValue.includes(":")) {
		const [category, subcategory] = filterValue.split(":");
		if (String(item.category) !== category) return false;
		return (
			item.subcategory !== undefined && String(item.subcategory) === subcategory
		);
	}
	return String(item.category) === filterValue;
};

type CategoryOption = {
	label: string;
	value: string;
};

type GroupedOption = {
	group: string;
	items: CategoryOption[];
};

function getItemSubcategories(items: AppItem[]): GroupedOption[] {
	const categoryMap = new Map<string, Set<string>>();

	for (const item of items) {
		const cat = String(item.category);
		if (!categoryMap.has(cat)) {
			categoryMap.set(cat, new Set());
		}

		if (item.subcategory) {
			const subcategoryValue = `${cat}:${String(item.subcategory)}`;
			categoryMap.get(cat)?.add(subcategoryValue);
		}
	}

	const groupedOptions: GroupedOption[] = [];

	for (const [category, subcategories] of categoryMap.entries()) {
		const options: CategoryOption[] = [];

		options.push({
			label: `All ${titleCase(category)}`,
			value: category,
		});

		if (subcategories.size > 0) {
			for (const subcategory of Array.from(subcategories).sort()) {
				const [, type] = subcategory.split(":");
				options.push({
					label: `Only ${titleCase(type ?? "")} ${titleCase(category)}`,
					value: subcategory,
				});
			}
		}

		groupedOptions.push({ group: titleCase(category), items: options });
	}

	return groupedOptions.sort((a, b) => a.group.localeCompare(b.group));
}

function titleCase(str: string): string {
	return str
		.split(/[_ ]/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

export { getItemSubcategories, formatCategoryLabel, itemMatchesCategory };
