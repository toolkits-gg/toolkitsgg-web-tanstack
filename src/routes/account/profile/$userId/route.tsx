import { Box, Stack, Text, Title } from "@mantine/core";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { useSession } from "#/integrations/better-auth/auth-client";
import { ProfileHeader } from "#/features/auth/components/ProfileHeader";
import { ProfileTabNav } from "#/features/auth/components/ProfileTabNav";
import { resolveAvatar } from "#/features/auth/utils/resolve-avatar";
import { getPublicUserProfileServerFn } from "#/features/dal/server/user-profile";
import type { GameId } from "@/prisma";

export const Route = createFileRoute("/account/profile/$userId")({
	loader: async ({ params }) => {
		const user = await getPublicUserProfileServerFn({
			data: { userId: params.userId },
		});
		if (!user?.userProfile) throw notFound();
		return { user };
	},
	notFoundComponent: () => (
		<Box p="md">
			<Title order={1}>Profile Not Found</Title>
			<Text>This user profile does not exist.</Text>
		</Box>
	),
	component: ProfileLayout,
});

function ProfileLayout() {
	const { user } = Route.useLoaderData();
	const { data: session } = useSession();
	const { userId } = Route.useParams();

	const isOwner = !!session?.user && session.user.id === user.id;
	const profile = user.userProfile!;

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
			<ProfileTabNav basePath={`/account/profile/${userId}`} showDataSync={isOwner} />
			<Box p="md">
				<Outlet />
			</Box>
		</Stack>
	);
}
