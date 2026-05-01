import { userProfileActions } from "#/features/auth/dal/user-profile/user-profile.actions";
import { resolveAvatar } from "#/features/auth/utils/resolve-avatar";
import { useDalQuery } from "#/features/dal/hooks/use-dal-query";
import { useGameId } from "#/features/game/hooks/use-game-id";

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
