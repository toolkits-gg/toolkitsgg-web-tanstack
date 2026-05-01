import { userProfileActions } from "#/features/auth/dal/user-profile/user-profile.actions";
import { useDalMutation } from "#/features/dal/hooks/use-dal-mutation";
import { useDalQuery } from "#/features/dal/hooks/use-dal-query";
import { useSession } from "#/integrations/better-auth/auth-client";
import type { GameId } from "@/prisma";

export function useUserProfile() {
	const { data: session, isPending: sessionPending } = useSession();
	const profileQuery = useDalQuery(userProfileActions.getProfile, undefined);
	const updateAvatarMutation = useDalMutation(userProfileActions.updateAvatar);
	const removePrimaryAvatarMutation = useDalMutation(
		userProfileActions.removePrimaryAvatar,
	);
	const removeAvatarOverrideMutation = useDalMutation(
		userProfileActions.removeAvatarOverride,
	);

	const isAuthenticated = !!session?.user;
	const isLoading = sessionPending || profileQuery.isPending;

	return {
		profile: profileQuery.data ?? null,
		isAuthenticated,
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
}
