import { Box, Stack, Text, Title } from "@mantine/core";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { ProfileHeader } from "#/features/auth/core/ProfileHeader";
import { ProfileTabNav } from "#/features/auth/core/ProfileTabNav";
import { resolveAvatar } from "#/features/auth/core/utils";
import { getPublicUserProfileServerFn } from "#/features/auth/dal/user-profile/user-profile";
import { getViewerUserIdServerFn } from "#/features/auth/dal/user-profile/user-profile.actions";
import type { GameId } from "@/prisma";

function ProfileLayout() {
	const { user, isOwner } = Route.useLoaderData();
	const { userId } = Route.useParams();
	if (!user.userProfile) throw notFound();

	const profile = user.userProfile;

	const { avatarUrl: serverAvatarUrl } = resolveAvatar({
		primaryAvatarId: profile.primaryAvatarId ?? null,
		primaryAvatarGameId: (profile.primaryAvatarGameId as GameId) ?? null,
		overrides: profile.avatarOverrides.map((o) => ({
			gameId: o.gameId as GameId,
			avatarId: o.avatarId,
			avatarGameId: o.gameId as GameId,
		})),
		currentGameId: "none",
		fallbackAvatarUrl: profile.avatarUrl ?? null,
	});

	return (
		<Stack gap={0}>
			<ProfileHeader
				displayName={profile.displayName}
				bio={profile.bio}
				serverAvatarUrl={serverAvatarUrl}
				isOwner={isOwner}
			/>
			<ProfileTabNav
				basePath={`/account/profile/${userId}`}
				showDataSync={isOwner}
			/>
			<Box p="md">
				<Outlet />
			</Box>
		</Stack>
	);
}

const Route = createFileRoute("/account/profile/$userId")({
	loader: async ({ params }) => {
		const user = await getPublicUserProfileServerFn({
			data: { userId: params.userId },
		});
		if (!user?.userProfile) throw notFound();
		const viewerUserId = await getViewerUserIdServerFn();
		return { user, isOwner: viewerUserId === user.id };
	},
	notFoundComponent: () => (
		<Box p="md">
			<Title order={1}>Profile Not Found</Title>
			<Text>This user profile does not exist.</Text>
		</Box>
	),
	component: ProfileLayout,
});

export { Route };
