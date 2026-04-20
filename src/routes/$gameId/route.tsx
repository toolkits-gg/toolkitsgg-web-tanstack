// src/routes/games/$gameId/route.tsx

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { setGame } from "#/features/game/store/game-store";

export const Route = createFileRoute("/$gameId")({
	component: function GameRouteLayout() {
		const { gameId } = Route.useParams();

		// When the route changes, update the game in our global store
		useEffect(() => {
			setGame(gameId, "route");
		}, [gameId]);

		return <Outlet />;
	},
});
