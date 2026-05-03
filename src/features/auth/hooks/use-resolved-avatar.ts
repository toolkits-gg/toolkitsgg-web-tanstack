import { resolveAvatar } from "#/features/auth/core/utils";
import { userProfileActions } from "#/features/auth/dal/user-profile/user-profile.actions";
import { useDalQuery } from "#/features/dal/hooks/use-dal-query";
import { useGameId } from "#/features/game/core/use-game-id";

export function useResolvedAvatar() {
	const gameId = useGameId();
	const { data: profile } = useDalQuery(
		userProfileActions.getProfile,
		undefined,
	);

	const { avatarUrl } = resolveAvatar({
		primaryAvatarId: profile?.primaryAvatarId ?? null,
		primaryAvatarGameId: profile?.primaryAvatarGameId ?? null,
		overrides: profile?.avatarOverrides ?? [],
		currentGameId: gameId,
		fallbackAvatarUrl: profile?.avatarUrl ?? null,
	});

	return { avatarUrl };
}
