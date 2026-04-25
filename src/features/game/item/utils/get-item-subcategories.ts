import type { AppItem } from "#/features/game/item/types/app-item";

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

export { getItemSubcategories };
export type { CategoryOption, GroupedOption };
