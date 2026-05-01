import { favoriteGameActions } from "#/features/auth/dal/favorite-games/favorite-games.actions";
import { userProfileActions } from "#/features/auth/dal/user-profile/user-profile.actions";
import type { DalWriteAction } from "#/features/dal/core/types";
import { GAME_REGISTRY } from "#/features/game/registry/game-registry";

const gameCollectedWriteActions = Object.values(GAME_REGISTRY).flatMap(
	(config) => [
		config.DAL.collectedItems.collect as unknown as DalWriteAction<
			unknown,
			unknown
		>,
		config.DAL.collectedItems.uncollect as unknown as DalWriteAction<
			unknown,
			unknown
		>,
	],
);

const writeActions: Array<DalWriteAction<unknown, unknown>> = [
	...gameCollectedWriteActions,
	favoriteGameActions.favorite as unknown as DalWriteAction<unknown, unknown>,
	favoriteGameActions.unfavorite as unknown as DalWriteAction<unknown, unknown>,
	userProfileActions.updateAvatar as unknown as DalWriteAction<
		unknown,
		unknown
	>,
	userProfileActions.removeAvatarOverride as unknown as DalWriteAction<
		unknown,
		unknown
	>,
	userProfileActions.removePrimaryAvatar as unknown as DalWriteAction<
		unknown,
		unknown
	>,
];

export function resolveWriteAction(
	entity: string,
): DalWriteAction<unknown, unknown> | null {
	return writeActions.find((a) => a.entity === entity) ?? null;
}
