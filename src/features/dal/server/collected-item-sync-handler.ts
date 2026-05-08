// SyncHandler for collected items — handles both upsert and delete ops with LWW conflict resolution.

import type { SyncHandler } from "#/features/dal/core/types";
import {
	compareTimestamps,
	type HasUpdatedAt,
} from "#/features/dal/queue/last-write-wins";

// Structural interface so the same handler works with any game's Prisma model delegate
// without importing game-specific generated types. Each game passes its own model instance.
interface CollectedItemDelegate {
	findUnique(args: {
		where: { userId_itemId: { userId: string; itemId: string } };
	}): Promise<HasUpdatedAt | null>;
	deleteMany(args: {
		where: { userId: string; itemId: string };
	}): Promise<unknown>;
	create(args: { data: { userId: string; itemId: string } }): Promise<unknown>;
}

/** Creates a SyncHandler for a game's collected-item Prisma model. */
const createCollectedItemSyncHandler = (
	model: CollectedItemDelegate,
): SyncHandler => {
	return async (op, userId, options) => {
		const payload = op.payload as { itemId?: string } | null;
		const itemId = payload?.itemId;
		if (!itemId) return { status: "error", message: "missing itemId" };

		const record = await model.findUnique({
			where: { userId_itemId: { userId, itemId } },
		});
		const force = options?.force ?? false;

		if (op.operation === "delete") {
			// Record already absent — noop regardless of timestamps (desired end state achieved).
			if (!record) return { status: "noop" };
			// LWW check: only run when a record exists. If the server record is newer,
			// another writer added or updated it after this op was enqueued — conflict.
			// `force` short-circuits the check so the user's "Keep mine" choice wins.
			if (!force) {
				const cmp = compareTimestamps(record, op);
				if (cmp === "server-wins")
					return {
						status: "conflict",
						serverRecordJson: JSON.stringify(record),
					};
			}
			await model.deleteMany({ where: { userId, itemId } });
			return { status: "applied" };
		}

		// Upsert path: if the record already exists, LWW decides whether the server
		// record wins (conflict) or the op is simply redundant (noop). No update is
		// needed because CollectedItem has no mutable fields beyond its existence —
		// the item is either collected or not. With `force`, an existing record is
		// treated as already representing the desired state (noop) since the local
		// op is also an upsert with no fields to overwrite.
		if (record) {
			if (force) return { status: "noop" };
			const cmp = compareTimestamps(record, op);
			if (cmp === "server-wins")
				return { status: "conflict", serverRecordJson: JSON.stringify(record) };
			return { status: "noop" };
		}

		await model.create({ data: { userId, itemId } });
		return { status: "applied" };
	};
};

export { createCollectedItemSyncHandler };
