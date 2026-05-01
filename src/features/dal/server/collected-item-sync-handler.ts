import type { SyncHandler } from "#/features/dal/core/types";
import {
	compareTimestamps,
	type HasUpdatedAt,
} from "#/features/dal/queue/last-write-wins";

interface CollectedItemDelegate {
	findUnique(args: {
		where: { userId_itemId: { userId: string; itemId: string } };
	}): Promise<HasUpdatedAt | null>;
	deleteMany(args: {
		where: { userId: string; itemId: string };
	}): Promise<unknown>;
	create(args: { data: { userId: string; itemId: string } }): Promise<unknown>;
}

const createCollectedItemSyncHandler = (
	model: CollectedItemDelegate,
): SyncHandler => {
	return async (op, userId) => {
		const payload = op.payload as { itemId?: string } | null;
		const itemId = payload?.itemId;
		if (!itemId) return { status: "error", message: "missing itemId" };

		const record = await model.findUnique({
			where: { userId_itemId: { userId, itemId } },
		});

		if (op.operation === "delete") {
			if (!record) return { status: "noop" };
			const cmp = compareTimestamps(record, op);
			if (cmp === "server-wins")
				return { status: "conflict", serverRecordJson: JSON.stringify(record) };
			await model.deleteMany({ where: { userId, itemId } });
			return { status: "applied" };
		}

		if (record) {
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
