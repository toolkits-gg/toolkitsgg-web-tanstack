import { Box, Stack } from "@mantine/core";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProfileHeader } from "#/features/auth/components/ProfileHeader";
import { ProfileTabNav } from "#/features/auth/components/ProfileTabNav";
import { useUserProfile } from "#/features/auth/hooks/use-user-profile";

export const Route = createFileRoute("/profile")({
	component: LocalProfileLayout,
});

function LocalProfileLayout() {
	const { profile } = useUserProfile();

	return (
		<Stack gap={0}>
			<ProfileHeader
				displayName={profile?.displayName ?? "Traveler"}
				bio={profile?.bio ?? ""}
				serverAvatarUrl={null}
				isOwner={true}
			/>
			<ProfileTabNav basePath="/profile" showDataSync={false} />
			<Box p="md">
				<Outlet />
			</Box>
		</Stack>
	);
}
