import { Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

function CollectionStats() {
	return (
		<Stack gap="sm">
			<Title order={3}>Collection Stats</Title>
			<Text c="dimmed">Content coming soon.</Text>
		</Stack>
	);
}

const Route = createFileRoute("/profile/collection-stats")({
	component: CollectionStats,
});

export { Route };
