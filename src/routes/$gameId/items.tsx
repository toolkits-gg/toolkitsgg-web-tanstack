import { createFileRoute } from "@tanstack/react-router";
import { getGameConfig } from "#/features/game/registry/game-registry";

export const Route = createFileRoute("/$gameId/items")({
	component: function ItemsPage() {
		const { gameId } = Route.useParams();
		const config = getGameConfig(gameId);
		return <>{config?.PAGES.renderItemLookup()}</>;
	},
});
