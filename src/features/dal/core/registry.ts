// Flat write-action registry used by syncOps to resolve pending ops to their handlers.
// Every DalWriteAction whose entity could appear in the pending-ops queue must be listed here.

import { favoriteGameActions } from "#/features/auth/dal/favorite-games/favorite-games.actions";
import { userProfileActions } from "#/features/auth/dal/user-profile/user-profile.actions";
import type { DalWriteAction } from "#/features/dal/core/types";
import { GAME_REGISTRY } from "#/features/game/registry/game-registry";

// Gather collect + uncollect actions for every registered game.
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

// The type casts to DalWriteAction<unknown, unknown> are required because each action
// carries its own concrete Input/Output generics; erasing them lets them coexist in one array.
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

/**
 * Looks up the DalWriteAction for a given entity string.
 * Returns null when no action is registered, which causes syncOps to mark the op "failed".
 */
export function resolveWriteAction(
	entity: string,
): DalWriteAction<unknown, unknown> | null {
	return writeActions.find((a) => a.entity === entity) ?? null;
}
