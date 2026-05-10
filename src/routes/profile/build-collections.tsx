import { Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

function BuildCollections() {
	return (
		<Stack gap="sm">
			<Title order={3}>Build Collections</Title>
			<Text c="dimmed">Content coming soon.</Text>
		</Stack>
	);
}

const Route = createFileRoute("/profile/build-collections")({
	component: BuildCollections,
});

export { Route };
