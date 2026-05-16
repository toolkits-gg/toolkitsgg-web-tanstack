import { Box, Stack, Text, Title } from "@mantine/core";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { ProfileHeader } from "#/features/auth/core/ProfileHeader";
import { ProfileTabNav } from "#/features/auth/core/ProfileTabNav";
import { getPublicUserProfileServerFn } from "#/features/auth/dal/user-profile/user-profile";
import {
	buildGetProfileQueryKey,
	getViewerUserIdServerFn,
	mapUserToProfileData,
} from "#/features/auth/dal/user-profile/user-profile.actions";

const ProfileLayout = () => {
	const { isOwner } = Route.useLoaderData();
	const { userId } = Route.useParams();

	return (
		<Stack gap={0}>
			<ProfileHeader userId={userId} isOwner={isOwner} />
			<ProfileTabNav
				basePath={`/account/profile/${userId}`}
				showDataSync={isOwner}
			/>
			<Box p="md">
				<Outlet />
			</Box>
		</Stack>
	);
};

const Route = createFileRoute("/account/profile/$userId")({
	loader: async ({ params, context }) => {
		const { queryClient } = context;
		const profile = await queryClient.ensureQueryData({
			queryKey: buildGetProfileQueryKey(params.userId),
			queryFn: async () => {
				const user = await getPublicUserProfileServerFn({
					data: { userId: params.userId },
				});
				return mapUserToProfileData(user);
			},
		});
		if (!profile) throw notFound();
		const viewerUserId = await getViewerUserIdServerFn();
		return { isOwner: viewerUserId === params.userId };
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
