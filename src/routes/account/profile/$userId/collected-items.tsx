import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
	buildTabHead,
	loadProfileTabData,
} from "#/features/auth/core/profile-tab-head";
import { gameStore, setGame } from "#/features/game/core/store";
import { useGameState } from "#/features/game/core/use-game-id";
import {
	getGameConfig,
	getGameMetadata,
	isRegisteredGameId,
} from "#/features/game/registry/game-registry";
import type { GameId } from "@/prisma";

type CollectedItemsSearch = {
	gameId?: GameId;
};

const parentRouteApi = getRouteApi("/account/profile/$userId");

const CollectedItems = () => {
	const { userId } = Route.useParams();
	const { isOwner } = parentRouteApi.useLoaderData();
	const { gameId: urlGameId } = Route.useSearch();
	const navigate = Route.useNavigate();
	const { gameId: storeGameIdRaw, source } = useGameState();
	const storeGameId: GameId = storeGameIdRaw ?? "none";

	// Render off url gameId to prevent hydration error.
	// Store reads from localstorage, which causes the issue since it is null on server.
	// Effects will still handle the needed sync after hydration.
	const config = urlGameId ? getGameConfig(urlGameId) : undefined;
	const initializedRef = useRef(false);

	useEffect(() => {
		if (!urlGameId) return;
		// Read the store fresh here so a store update cannot retrigger this
		// effect and revert a GameSwitcher (toggle-source) write.
		const current = gameStore.state.gameId ?? "none";
		if (urlGameId !== current) {
			setGame(urlGameId, "route");
		}
	}, [urlGameId]);

	useEffect(() => {
		const firstRun = !initializedRef.current;
		initializedRef.current = true;
		// On mount, skip the store -> URL write if the URL already has a value (URL wins).
		// Exception: subdomain has authority over the URL, so we still need to sync
		// the URL to the subdomain game.
		if (firstRun && urlGameId && source !== "subdomain") return;
		if (storeGameId === "none") return;
		if (storeGameId === urlGameId) return;
		// Don't write back to URL if the store change was caused by our own
		// URL -> store sync above, but only when the URL already carries a gameId.
		// If we landed here from a `/$gameId/*` page, the store has source="route"
		// but the new URL has no gameId, so it still requires a sync.
		if (urlGameId && source === "route") return;
		void navigate({
			search: (prev) => ({ ...prev, gameId: storeGameId }),
			replace: true,
		});
	}, [storeGameId, source, urlGameId, navigate]);

	return (
		<>
			{config?.PAGES.renderCollectedItems({
				mode: isOwner ? { kind: "self" } : { kind: "public", userId },
			})}
		</>
	);
};

const Route = createFileRoute("/account/profile/$userId/collected-items")({
	validateSearch: (search: Record<string, unknown>): CollectedItemsSearch => {
		const raw = search.gameId;
		if (typeof raw === "string" && isRegisteredGameId(raw)) {
			return { gameId: raw };
		}
		return {};
	},
	loader: async ({ params, context, location }) => {
		const { displayName } = await loadProfileTabData(
			params.userId,
			context.queryClient,
		);
		const gameId = (location.search as CollectedItemsSearch).gameId;
		const gameLabel = gameId ? getGameMetadata(gameId)?.label : undefined;
		const tabLabel = gameLabel
			? `${gameLabel} Collected Items`
			: "Collected Items";
		return { displayName, tabLabel };
	},
	head: ({ loaderData }) => ({
		meta: buildTabHead(
			loaderData?.displayName ?? "Toolkits.gg User",
			loaderData?.tabLabel ?? "Collected Items",
		),
	}),
	component: CollectedItems,
});

export { Route };
