// Thin Prisma wrappers for collected-item database operations.
// Used by per-game server functions to perform CRUD without duplicating Prisma call shapes.

import type { CollectedItemRecord } from "#/features/game/items/types";

/**
 * Structural interface satisfied by every game's Prisma collected-item model delegate.
 * Each game generates a different concrete type, but they all share this shape,
 * allowing one factory to work across all games.
 */
interface CollectedItemPrismaDelegate {
	upsert(args: {
		where: { userId_itemId: { userId: string; itemId: string } };
		update: object;
		create: { userId: string; itemId: string };
	}): Promise<CollectedItemRecord>;
	deleteMany(args: {
		where: { userId: string; itemId: string };
	}): Promise<unknown>;
	findMany(args: { where: { userId: string } }): Promise<CollectedItemRecord[]>;
}

/** Creates database helpers for a game's collected-item Prisma model. */
export function createCollectedItemHandlers(
	model: CollectedItemPrismaDelegate,
) {
	return {
		/** Upserts a collected-item row for the given user and item. */
		async collect(
			itemId: string,
			userId: string,
		): Promise<CollectedItemRecord> {
			return model.upsert({
				where: { userId_itemId: { userId, itemId } },
				update: {},
				create: { userId, itemId },
			});
		},
		/** Removes a collected-item row. No-op if it doesn't exist. */
		async uncollect(itemId: string, userId: string): Promise<{ ok: true }> {
			await model.deleteMany({ where: { userId, itemId } });
			return { ok: true };
		},
		/** Returns all collected items for a user. */
		async list(userId: string): Promise<CollectedItemRecord[]> {
			return model.findMany({ where: { userId } });
		},
	};
}
