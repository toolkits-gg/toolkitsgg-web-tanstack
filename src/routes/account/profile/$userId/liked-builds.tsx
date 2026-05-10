import { Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

function LikedBuilds() {
	return (
		<Stack gap="sm">
			<Title order={3}>Liked Builds</Title>
			<Text c="dimmed">Content coming soon.</Text>
		</Stack>
	);
}

const Route = createFileRoute("/account/profile/$userId/liked-builds")({
	component: LikedBuilds,
});

export { Route };
