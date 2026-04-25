// src/routes/games/$gameId/route.tsx

import { Box, Text, Title } from "@mantine/core";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { isRegisteredGameId } from "#/features/game/registry/game-registry";
import { setGame } from "#/features/game/store/game-store";
import type { GameId } from "@/prisma";

export const Route = createFileRoute("/$gameId")({
	head: ({ params }) => ({
		links: [
			{
				rel: "icon",
				type: "image/x-icon",
				href: `/favicons/${params.gameId}/favicon.ico`,
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: `/favicons/${params.gameId}/favicon-32x32.png`,
			},
			{
				rel: "apple-touch-icon",
				href: `/favicons/${params.gameId}/apple-touch-icon.png`,
			},
		],
	}),
	notFoundComponent: () => {
		return (
			<Box p="md">
				<Title order={1}>404 - Game Not Found</Title>
				<Text>The page you are looking for does not exist.</Text>
			</Box>
		);
	},
	component: function GameRouteLayout() {
		const { gameId } = Route.useParams();

		const validatedGameId = (
			isRegisteredGameId(gameId) ? gameId : "none"
		) satisfies GameId;

		// When the route changes, update the game in our global store
		useEffect(() => {
			setGame(validatedGameId, "route");
		}, [validatedGameId]);

		return <Outlet />;
	},
});
