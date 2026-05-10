import { Box, Stack } from "@mantine/core";
import { useNetwork } from "@mantine/hooks";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ProfileHeader } from "#/features/auth/core/ProfileHeader";
import { ProfileTabNav } from "#/features/auth/core/ProfileTabNav";
import { useUserProfile } from "#/features/auth/hooks/use-user-profile";
import { useSession } from "#/integrations/better-auth/auth-client";

function LocalProfileLayout() {
	const { profile } = useUserProfile();
	const { data: session } = useSession();
	const { online } = useNetwork();
	const navigate = useNavigate();

	const authedUserId = session?.user?.id;
	useEffect(() => {
		if (online && authedUserId) {
			navigate({
				to: "/account/profile/$userId",
				params: { userId: authedUserId },
				replace: true,
			});
		}
	}, [online, authedUserId, navigate]);

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

const Route = createFileRoute("/profile")({
	component: LocalProfileLayout,
});

export { Route };
