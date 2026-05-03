import type { CollectedItemRecord } from "#/features/game/items/types";

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

export function createCollectedItemHandlers(
	model: CollectedItemPrismaDelegate,
) {
	return {
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
		async uncollect(itemId: string, userId: string): Promise<{ ok: true }> {
			await model.deleteMany({ where: { userId, itemId } });
			return { ok: true };
		},
		async list(userId: string): Promise<CollectedItemRecord[]> {
			return model.findMany({ where: { userId } });
		},
	};
}
