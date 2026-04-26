import { Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account/profile/$userId/data-sync")({
	component: DataSync,
});

function DataSync() {
	return (
		<Stack gap="sm">
			<Title order={3}>Data Sync</Title>
			<Text c="dimmed">Content coming soon.</Text>
		</Stack>
	);
}
