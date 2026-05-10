import { createFileRoute } from "@tanstack/react-router";
import { useGameId } from "#/features/game/core/use-game-id";
import { getGameConfig } from "#/features/game/registry/game-registry";

function CollectedItems() {
	const gameId = useGameId();
	const config = getGameConfig(gameId);
	return <>{config?.PAGES.renderCollectedItems({ mode: { kind: "self" } })}</>;
}

const Route = createFileRoute("/profile/collected-items")({
	component: CollectedItems,
});

export { Route };
