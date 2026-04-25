import { Box } from "@mantine/core";
import { useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";
import { collectedItemActions } from "#/features/dal/actions/collected-items";
import { useDalMutation } from "#/features/dal/hooks/use-dal-mutation";
import { useDalQuery } from "#/features/dal/hooks/use-dal-query";
import type { ActiveFilter } from "#/features/game/item/components/ItemFilterBar";
import { ItemFilterBar } from "#/features/game/item/components/ItemFilterBar";
import { ItemVirtualGrid } from "#/features/game/item/components/ItemVirtualGrid";
import type { GameFilterConfig } from "#/features/game/item/types/game-filter-config";
import type { AnyGameConfig } from "#/features/game/registry/game-registry";
import {
	dimUncollectedItemsParser,
	searchParser,
	showCollectableOnlyParser,
	showCollectedItemsParser,
	showUncollectedItemsParser,
} from "#/search-params";

type AppItemPageProps = {
	items: AnyGameConfig["ITEMS"];
	gameFilterConfig?: GameFilterConfig;
};

const universalParsers = {
	search: searchParser,
	showCollectedItems: showCollectedItemsParser,
	showUncollectedItems: showUncollectedItemsParser,
	dimUncollectedItems: dimUncollectedItemsParser,
	showCollectableOnly: showCollectableOnlyParser,
};

const AppItemPage = ({ items, gameFilterConfig }: AppItemPageProps) => {
	const [universalParams, setUniversalParams] =
		useQueryStates(universalParsers);
	const {
		search,
		showCollectedItems,
		showUncollectedItems,
		dimUncollectedItems,
		showCollectableOnly,
	} = universalParams;

	const [gameParams, setGameParams] = useQueryStates(
		gameFilterConfig?.parsers ?? {},
	);

	const activeGameParams: Record<string, string> = useMemo(() => {
		if (!gameFilterConfig) return {};
		return Object.fromEntries(
			gameFilterConfig.defs.map((def) => [
				def.key,
				(gameParams as Record<string, string>)[def.key] ?? def.defaultValue,
			]),
		);
	}, [gameFilterConfig, gameParams]);

	const setParam = useCallback(
		(key: string, value: string | undefined) => {
			setGameParams({ [key]: value ?? null } as Parameters<
				typeof setGameParams
			>[0]);
		},
		[setGameParams],
	);

	const setUniversalParam = useCallback(
		(key: keyof typeof universalParams, value: string | boolean) => {
			setUniversalParams({ [key]: value } as Parameters<
				typeof setUniversalParams
			>[0]);
		},
		[setUniversalParams],
	);

	const clearAllFilters = useCallback(() => {
		setUniversalParams({
			search: "",
			showCollectedItems: true,
			showUncollectedItems: true,
			dimUncollectedItems: false,
			showCollectableOnly: false,
		});
		if (gameFilterConfig) {
			setGameParams(
				Object.fromEntries(
					gameFilterConfig.defs.map((def) => [def.key, null]),
				) as Parameters<typeof setGameParams>[0],
			);
		}
	}, [setUniversalParams, setGameParams, gameFilterConfig]);

	// Collected items
	const { data: collectedData } = useDalQuery(
		collectedItemActions.list,
		undefined,
	);
	const collectedIds = useMemo(
		() => (collectedData ?? []).map((r) => r.itemId),
		[collectedData],
	);

	const { mutate: collect } = useDalMutation(collectedItemActions.collect);
	const { mutate: uncollect } = useDalMutation(collectedItemActions.uncollect);

	const handleCollect = useCallback(
		(id: string) => collect({ itemId: id }),
		[collect],
	);
	const handleUncollect = useCallback(
		(id: string) => uncollect({ itemId: id }),
		[uncollect],
	);

	// Filtering
	const isUncollectable = useCallback(
		(category: string) =>
			items.uncollectableCategories.some(
				(uc) => String(category).toLowerCase() === String(uc).toLowerCase(),
			),
		[items.uncollectableCategories],
	);

	const filteredItems = useMemo(() => {
		let result = items.all;

		// Search filter
		if (search.trim()) {
			const q = search.trim().toLowerCase();
			result = result.filter(
				(item) =>
					item.name.toLowerCase().includes(q) ||
					item.description.some((d) => d.toLowerCase().includes(q)) ||
					item.searchableTags?.some((t) => String(t).toLowerCase().includes(q)),
			);
		}

		// Collectable-only filter
		if (showCollectableOnly) {
			result = result.filter((item) => !isUncollectable(String(item.category)));
		}

		// Collected/uncollected visibility
		result = result.filter((item) => {
			const collected = collectedIds.includes(item.id);
			if (collected && !showCollectedItems) return false;
			if (!collected && !showUncollectedItems) return false;
			return true;
		});

		// Game-specific filters
		if (gameFilterConfig) {
			result = gameFilterConfig.filterItems(result, activeGameParams);
		}

		return result;
	}, [
		items.all,
		search,
		showCollectableOnly,
		showCollectedItems,
		showUncollectedItems,
		collectedIds,
		isUncollectable,
		gameFilterConfig,
		activeGameParams,
	]);

	const filteredCategories = useMemo(() => {
		const catSet = new Set(filteredItems.map((item) => String(item.category)));
		return items.categories.map((c) => String(c)).filter((c) => catSet.has(c));
	}, [filteredItems, items.categories]);

	const hasCollectableItems = items.collectable.length > 0;

	// Active filter chips
	const activeFilters: ActiveFilter[] = useMemo(() => {
		const filters: ActiveFilter[] = [];

		if (search) {
			filters.push({
				key: "search",
				label: "Search",
				value: search,
				onRemove: () => setUniversalParam("search", ""),
			});
		}
		if (!showCollectedItems) {
			filters.push({
				key: "showCollectedItems",
				label: "Collected",
				value: "Hidden",
				onRemove: () => setUniversalParam("showCollectedItems", true),
			});
		}
		if (!showUncollectedItems) {
			filters.push({
				key: "showUncollectedItems",
				label: "Uncollected",
				value: "Hidden",
				onRemove: () => setUniversalParam("showUncollectedItems", true),
			});
		}
		if (dimUncollectedItems) {
			filters.push({
				key: "dimUncollectedItems",
				label: "Uncollected",
				value: "Dimmed",
				onRemove: () => setUniversalParam("dimUncollectedItems", false),
			});
		}
		if (showCollectableOnly) {
			filters.push({
				key: "showCollectableOnly",
				label: "Collectable only",
				value: "Yes",
				onRemove: () => setUniversalParam("showCollectableOnly", false),
			});
		}

		// Game-specific active filters
		if (gameFilterConfig) {
			for (const def of gameFilterConfig.defs) {
				const raw = activeGameParams[def.key] ?? def.defaultValue;
				if (raw && raw !== def.defaultValue) {
					filters.push({
						key: def.key,
						label: def.label,
						value: def.formatValue ? def.formatValue(raw) : raw,
						onRemove: () => setParam(def.key, undefined),
					});
				}
			}
		}

		return filters;
	}, [
		search,
		showCollectedItems,
		showUncollectedItems,
		dimUncollectedItems,
		showCollectableOnly,
		gameFilterConfig,
		activeGameParams,
		setUniversalParam,
		setParam,
	]);

	const renderGameFilters =
		gameFilterConfig?.renderControls(
			activeGameParams,
			setParam,
			filteredItems,
		) ?? null;

	return (
		<Box>
			<ItemFilterBar
				search={search}
				onSearchChange={(v) => setUniversalParam("search", v)}
				showCollected={showCollectedItems}
				onShowCollectedChange={(v) =>
					setUniversalParam("showCollectedItems", v)
				}
				showUncollected={showUncollectedItems}
				onShowUncollectedChange={(v) =>
					setUniversalParam("showUncollectedItems", v)
				}
				dimUncollected={dimUncollectedItems}
				onDimUncollectedChange={(v) =>
					setUniversalParam("dimUncollectedItems", v)
				}
				showCollectableOnly={showCollectableOnly}
				onShowCollectableOnlyChange={(v) =>
					setUniversalParam("showCollectableOnly", v)
				}
				activeFilters={activeFilters}
				onClearAllFilters={clearAllFilters}
				renderGameFilters={renderGameFilters}
				hasCollectableItems={hasCollectableItems}
			/>
			<Box p="md">
				<ItemVirtualGrid
					items={filteredItems}
					categories={filteredCategories}
					uncollectableCategories={items.uncollectableCategories.map(String)}
					collectedIds={collectedIds}
					dimUncollected={dimUncollectedItems}
					onCollect={handleCollect}
					onUncollect={handleUncollect}
				/>
			</Box>
		</Box>
	);
};

export { AppItemPage };
export type { AppItemPageProps };
