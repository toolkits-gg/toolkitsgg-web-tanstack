import { ActionIcon, Box, Group, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import { ClientOnly, useRouterState } from "@tanstack/react-router";
import { parseAsBoolean, useQueryStates } from "nuqs";
import { LuShare2 } from "react-icons/lu";
import { useDalMutation } from "#/features/dal/hooks/use-dal-mutation";
import { useDalQuery } from "#/features/dal/hooks/use-dal-query";
import { useGameId } from "#/features/game/core/use-game-id";
import {
	type ActiveFilter,
	ItemFilterBar,
} from "#/features/game/items/ItemFilterBar";
import { ItemVirtualGrid } from "#/features/game/items/ItemVirtualGrid";
import type {
	AppItem,
	CollectedItemsViewMode,
	CollectItemInput,
	GameCollectedItemsDal,
	GameFilterConfig,
} from "#/features/game/items/types";
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
	resolveLinkedItems: (item: AppItem) => AppItem[];
	dal: GameCollectedItemsDal;
	gameFilterConfig?: GameFilterConfig;
	viewMode?: CollectedItemsViewMode;
};

const itemLookupParsers = {
	search: searchParser,
	showCollectedItems: showCollectedItemsParser,
	showUncollectedItems: showUncollectedItemsParser,
	dimUncollectedItems: dimUncollectedItemsParser,
	showCollectableOnly: showCollectableOnlyParser,
};

// Hide uncollected items by default on the Profile collected items tab
const collectedItemsTabParsers = {
	...itemLookupParsers,
	showUncollectedItems: parseAsBoolean.withDefault(false).withOptions({
		shallow: true,
		clearOnDefault: true,
	}),
};

const AppItemPage = ({
	items,
	resolveLinkedItems,
	dal,
	gameFilterConfig,
	viewMode,
}: AppItemPageProps) => {
	const isCollectedItemsTab = viewMode !== undefined;
	const isPublicView = viewMode?.kind === "public";
	const publicUserId = viewMode?.kind === "public" ? viewMode.userId : null;
	const activeGameId = useGameId();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	const handleShare = async () => {
		const baseUrl =
			import.meta.env.VITE_APP_URL ||
			(typeof window !== "undefined" ? window.location.origin : "");
		const url = `${baseUrl}${pathname}?gameId=${activeGameId}`;
		try {
			await navigator.clipboard.writeText(url);
			notifications.show({
				title: "Link copied",
				message: "Share link copied to clipboard",
				color: "green",
			});
		} catch {
			notifications.show({
				title: "Couldn't copy link",
				message: "Try again or copy from the address bar.",
				color: "red",
			});
		}
	};
	const [universalParams, setUniversalParams] = useQueryStates(
		isCollectedItemsTab ? collectedItemsTabParsers : itemLookupParsers,
	);
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

	const getActiveGameParams = (): Record<string, string> => {
		if (!gameFilterConfig) return {};
		return Object.fromEntries(
			gameFilterConfig.defs.map((def) => [
				def.key,
				(gameParams as Record<string, string>)[def.key] ?? def.defaultValue,
			]),
		);
	};
	const activeGameParams = getActiveGameParams();

	const setParam = (key: string, value: string | undefined) => {
		return setGameParams({ [key]: value ?? null } as Parameters<
			typeof setGameParams
		>[0]);
	};

	const setUniversalParam = (
		key: keyof typeof universalParams,
		value: string | boolean,
	): Promise<URLSearchParams> => {
		return setUniversalParams({ [key]: value } as Parameters<
			typeof setUniversalParams
		>[0]);
	};

	const clearAllFilters = () => {
		setUniversalParams({
			search: "",
			showCollectedItems: true,
			showUncollectedItems: !isCollectedItemsTab,
			dimUncollectedItems: false,
			showCollectableOnly: false,
		}).then(() => {
			// placeholder - no action needed
		});
		if (gameFilterConfig) {
			setGameParams(
				Object.fromEntries(
					gameFilterConfig.defs.map((def) => [def.key, null]),
				) as Parameters<typeof setGameParams>[0],
			).then(() => {
				// placeholder - no action needed
			});
		}
	};

	// Collected items: own vs. public
	const selfQuery = useDalQuery(dal.list, undefined);
	const publicQuery = useQuery({
		queryKey: [...dal.list.queryKey(undefined), "byUserId", publicUserId],
		queryFn: () =>
			publicUserId
				? dal.listByUserIdServerFn({ data: { userId: publicUserId } })
				: Promise.resolve([]),
		enabled: isPublicView && !!publicUserId,
	});
	const collectedData = isPublicView ? publicQuery.data : selfQuery.data;
	const collectedIds = (collectedData ?? []).map((r) => r.itemId);

	const { mutate: collect } = useDalMutation(dal.collect);
	const { mutate: uncollect } = useDalMutation(dal.uncollect);

	const handleCollect = ({ itemId, itemName }: CollectItemInput) =>
		collect({ itemId, itemName });

	const handleUncollect = ({ itemId, itemName }: CollectItemInput) =>
		uncollect({ itemId, itemName });

	// Filtering
	const isUncollectable = (category: string) =>
		items.uncollectableCategories.some(
			(uc) => String(category).toLowerCase() === String(uc).toLowerCase(),
		);

	const getFilteredItems = () => {
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
			return !(!collected && !showUncollectedItems);
		});

		// Game-specific filters
		if (gameFilterConfig) {
			result = gameFilterConfig.filterItems(result, activeGameParams);
		}

		return result;
	};
	const filteredItems = getFilteredItems();

	const getFilteredCategories = () => {
		const catSet = new Set(filteredItems.map((item) => String(item.category)));
		return items.categories.map((c) => String(c)).filter((c) => catSet.has(c));
	};
	const filteredCategories = getFilteredCategories();

	const hasCollectableItems = items.collectable.length > 0;

	// Active filter chips
	const getActiveFilters = (): ActiveFilter[] => {
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
		if (isCollectedItemsTab) {
			if (showUncollectedItems) {
				filters.push({
					key: "showUncollectedItems",
					label: "Uncollected",
					value: "Visible",
					onRemove: () => setUniversalParam("showUncollectedItems", false),
				});
			}
		} else if (!showUncollectedItems) {
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
	};
	const activeFilters = getActiveFilters();

	const renderGameFilters =
		gameFilterConfig?.renderControls(
			activeGameParams,
			setParam,
			filteredItems,
		) ?? null;

	return (
		<Box>
			{isCollectedItemsTab && (
				<ClientOnly>
					<Group justify="flex-end" px="md" pt="xs">
						<Tooltip label="Copy share link">
							<ActionIcon
								variant="subtle"
								onClick={handleShare}
								aria-label="Copy share link"
							>
								<LuShare2 size={16} />
							</ActionIcon>
						</Tooltip>
					</Group>
				</ClientOnly>
			)}
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
					resolveLinkedItems={resolveLinkedItems}
					categories={filteredCategories}
					uncollectableCategories={items.uncollectableCategories.map(String)}
					collectedIds={collectedIds}
					dimUncollected={dimUncollectedItems}
					onCollect={handleCollect}
					onUncollect={handleUncollect}
					readOnly={isPublicView}
				/>
			</Box>
		</Box>
	);
};

export { AppItemPage };
export type { AppItemPageProps };
