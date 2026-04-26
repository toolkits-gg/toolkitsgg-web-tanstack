import { Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account/profile/$userId/")({
	component: ProfileHome,
});

function ProfileHome() {
	return (
		<Stack gap="sm">
			<Title order={3}>Profile</Title>
			<Text c="dimmed">Content coming soon.</Text>
		</Stack>
	);
}
