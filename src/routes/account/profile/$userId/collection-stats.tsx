import { Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account/profile/$userId/collection-stats")({
	component: CollectionStats,
});

function CollectionStats() {
	return (
		<Stack gap="sm">
			<Title order={3}>Collection Stats</Title>
			<Text c="dimmed">Content coming soon.</Text>
		</Stack>
	);
}
