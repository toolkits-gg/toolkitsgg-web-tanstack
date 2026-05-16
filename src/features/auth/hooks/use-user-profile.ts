import { userProfileActions } from "#/features/auth/dal/user-profile/user-profile.actions";
import { useDalMutation } from "#/features/dal/hooks/use-dal-mutation";
import { useDalQuery } from "#/features/dal/hooks/use-dal-query";
import { useSession } from "#/integrations/better-auth/auth-client";
import type { GameId } from "@/prisma";

type UseUserProfileArgs = { userId?: string } | undefined;

const useUserProfile = (args?: UseUserProfileArgs) => {
	const { data: session, isPending: sessionPending } = useSession();
	const profileQuery = useDalQuery(
		userProfileActions.getProfile,
		args?.userId ? { userId: args.userId } : undefined,
	);
	const updateAvatarMutation = useDalMutation(userProfileActions.updateAvatar);
	const removePrimaryAvatarMutation = useDalMutation(
		userProfileActions.removePrimaryAvatar,
	);
	const removeAvatarOverrideMutation = useDalMutation(
		userProfileActions.removeAvatarOverride,
	);

	const isAuthenticated = !!session?.user;
	const isLoading = sessionPending || profileQuery.isPending;
	const isOwner =
		!!session?.user && (!args?.userId || session.user.id === args.userId);

	return {
		profile: profileQuery.data ?? null,
		isAuthenticated,
		isOwner,
		isLoading,
		session,
		updateAvatar: (params: {
			avatarId: string;
			avatarGameId: GameId;
			targetGameId?: GameId;
		}) => updateAvatarMutation.mutateAsync(params),
		removePrimaryAvatar: () =>
			removePrimaryAvatarMutation.mutateAsync(
				undefined as unknown as undefined,
			),
		removeAvatarOverride: (targetGameId: GameId) =>
			removeAvatarOverrideMutation.mutateAsync({ targetGameId }),
	};
};

export { useUserProfile };
