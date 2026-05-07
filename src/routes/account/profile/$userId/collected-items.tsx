import { createFileRoute } from "@tanstack/react-router";
import { getGameConfig } from "#/features/game/registry/game-registry";
import { useGameId } from "#/features/game/core/use-game-id";

export const Route = createFileRoute("/account/profile/$userId/collected-items")({
	component: CollectedItems,
});

function CollectedItems() {
	const { userId } = Route.useParams();
	const gameId = useGameId();
	const config = getGameConfig(gameId);
	return (
		<>
			{config?.PAGES.renderCollectedItems({
				mode: { kind: "public", userId },
			})}
		</>
	);
}
