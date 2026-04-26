import { userProfileActions } from "#/features/dal/actions/user-profile";
import { useDalQuery } from "#/features/dal/hooks/use-dal-query";
import { useGameId } from "#/features/game/hooks/use-game-id";
import { resolveAvatar } from "#/features/auth/utils/resolve-avatar";

export function useResolvedAvatar() {
	const gameId = useGameId();
	const { data: profile } = useDalQuery(userProfileActions.getProfile, undefined);

	const { avatarUrl } = resolveAvatar({
		primaryAvatarId: profile?.primaryAvatarId ?? null,
		primaryAvatarGameId: profile?.primaryAvatarGameId ?? null,
		overrides: profile?.avatarOverrides ?? [],
		currentGameId: gameId,
		fallbackAvatarUrl: profile?.avatarUrl ?? null,
	});

	return { avatarUrl };
}
