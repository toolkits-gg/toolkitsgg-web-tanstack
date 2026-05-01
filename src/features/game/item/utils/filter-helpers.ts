import type { AppItem } from "#/features/game/item/types/app-item";

export function titleCase(str: string): string {
	return str
		.split(/[_ ]/)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(" ");
}

/** Formats a comma-separated category filter value (or "cat:sub") into a human-readable label. */
export function formatCategoryLabel(raw: string): string {
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

/** Returns true if the item's category (and optional subcategory) matches the filter value. */
export function itemMatchesCategory(item: AppItem, filterValue: string): boolean {
	if (filterValue.includes(":")) {
		const [category, subcategory] = filterValue.split(":");
		if (String(item.category) !== category) return false;
		return (
			item.subcategory !== undefined && String(item.subcategory) === subcategory
		);
	}
	return String(item.category) === filterValue;
}
