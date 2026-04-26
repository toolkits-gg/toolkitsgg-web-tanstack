import { Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account/profile/$userId/build-collections")({
	component: BuildCollections,
});

function BuildCollections() {
	return (
		<Stack gap="sm">
			<Title order={3}>Build Collections</Title>
			<Text c="dimmed">Content coming soon.</Text>
		</Stack>
	);
}
