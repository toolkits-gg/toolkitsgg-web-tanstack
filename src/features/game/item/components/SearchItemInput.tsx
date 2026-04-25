import { type MantineColor, Select } from "@mantine/core";
import { useRef, useState } from "react";
import { useGameId } from "#/features/game/hooks/use-game-id";
import { getGameItems } from "#/features/game/registry/game-registry";
import classes from "./SearchItemInput.module.css";

type SearchItemInputProps = {
	searchValue: string;
	onSearchChange: (query: string) => void;
	onLoadingChange?: (loading: boolean) => void;
	color?: MantineColor;
};

const SearchItemInput = ({
	searchValue,
	onSearchChange,
	onLoadingChange,
	color = "primary",
}: SearchItemInputProps) => {
	const timeoutRef = useRef<number>(-1);
	const [value, setValue] = useState(searchValue);
	const [loading, setLoading] = useState(false);

	const gameId = useGameId();
	const items = getGameItems(gameId);

	const data = items
		? items.categories.map((category) => ({
				group: category,
				items: items.all
					.filter((item) => item.category === category)
					.map((item) => ({
						label: item.name,
						value: item.id,
					})),
			}))
		: [];

	const handleSearchChange = (query: string) => {
		window.clearTimeout(timeoutRef.current);
		setValue(query);

		if (query.trim() === value.trim()) return;

		setLoading(true);
		onLoadingChange?.(true);

		timeoutRef.current = window.setTimeout(() => {
			onSearchChange(query);
			setLoading(false);
			onLoadingChange?.(false);
		}, 500);
	};

	return (
		<Select
			searchable
			clearable
			searchValue={value}
			onSearchChange={handleSearchChange}
			loading={loading}
			placeholder="Search for an item"
			data={data}
			nothingFoundMessage="No items found"
			comboboxProps={{ transitionProps: { transition: "pop", duration: 200 } }}
			style={
				{
					width: "100%",
					"--search-item-input-color": `var(--mantine-color-${color}-6)`,
					"--search-item-input-color-hover": `var(--mantine-color-${color}-5)`,
					"--search-item-input-color-light": `var(--mantine-color-${color}-light)`,
					"--search-item-input-color-light-hover": `var(--mantine-color-${color}-light-hover)`,
				} as React.CSSProperties
			}
			classNames={{
				input: classes.input,
				dropdown: classes.dropdown,
				option: classes.option,
			}}
		/>
	);
};

export { SearchItemInput };
