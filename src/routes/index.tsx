import { Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { setGame } from "#/features/game/core/store";

function App() {
	// set game to none for the home page
	useEffect(() => {
		setGame("none", "route");
	}, []);

	return <Title order={1}>Home Page</Title>;
}

const Route = createFileRoute("/")({ component: App });

export { Route };
