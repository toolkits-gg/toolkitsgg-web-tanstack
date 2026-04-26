import { Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/liked-builds")({
	component: LikedBuilds,
});

function LikedBuilds() {
	return (
		<Stack gap="sm">
			<Title order={3}>Liked Builds</Title>
			<Text c="dimmed">Content coming soon.</Text>
		</Stack>
	);
}
