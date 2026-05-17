import { Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import {
	buildTabHead,
	loadProfileTabData,
} from "#/features/auth/core/profile-tab-head";

function LikedBuilds() {
	return (
		<Stack gap="sm">
			<Title order={3}>Liked Builds</Title>
			<Text c="dimmed">Content coming soon.</Text>
		</Stack>
	);
}

const Route = createFileRoute("/account/profile/$userId/liked-builds")({
	loader: async ({ params, context }) =>
		loadProfileTabData(params.userId, context.queryClient),
	head: ({ loaderData }) => ({
		meta: buildTabHead(
			loaderData?.displayName ?? "Toolkits.gg User",
			"Liked Builds",
		),
	}),
	component: LikedBuilds,
});

export { Route };
