import { collectedItemActions } from "#/features/dal/actions/collected-items";
import { favoriteGameActions } from "#/features/dal/actions/favorite-games";
import type { DalWriteAction } from "#/features/dal/core/types";

const writeActions: Array<DalWriteAction<unknown, unknown>> = [
	collectedItemActions.collect as unknown as DalWriteAction<unknown, unknown>,
	collectedItemActions.uncollect as unknown as DalWriteAction<unknown, unknown>,
	favoriteGameActions.favorite as unknown as DalWriteAction<unknown, unknown>,
	favoriteGameActions.unfavorite as unknown as DalWriteAction<unknown, unknown>,
];

export function resolveWriteAction(
	entity: string,
): DalWriteAction<unknown, unknown> | null {
	return writeActions.find((a) => a.entity === entity) ?? null;
}
