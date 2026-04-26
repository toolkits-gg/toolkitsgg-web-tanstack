import { Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/created-builds")({
	component: CreatedBuilds,
});

function CreatedBuilds() {
	return (
		<Stack gap="sm">
			<Title order={3}>Created Builds</Title>
			<Text c="dimmed">Content coming soon.</Text>
		</Stack>
	);
}
