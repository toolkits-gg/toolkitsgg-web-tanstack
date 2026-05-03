import {
	defineDalRead,
	defineDalWrite,
} from "#/features/dal/core/define-action";
import { applyPendingOpServerFn } from "#/features/dal/server/apply-pending-ops";
import type {
	CollectedItemRecord,
	CollectItemInput,
	GameCollectedItemsDal,
} from "#/features/game/items/types";
import { getIDBClient } from "#/integrations/prisma-idb/idb-client";

interface CollectedItemIDBDelegate {
	findMany: (args: {
		where: { userId: string };
	}) => Promise<CollectedItemRecord[]>;
	upsert: (args: {
		where: { userId_itemId: { userId: string; itemId: string } };
		update: object;
		create: { userId: string; itemId: string };
	}) => Promise<CollectedItemRecord>;
	deleteMany: (args: {
		where: { userId: string; itemId?: string };
	}) => Promise<unknown>;
}

type IDBClient = Awaited<ReturnType<typeof getIDBClient>>;

interface CollectedItemServerFns {
	collectItemServerFn(opts: {
		data: CollectItemInput;
	}): Promise<CollectedItemRecord>;
	uncollectItemServerFn(opts: {
		data: CollectItemInput;
	}): Promise<{ ok: true }>;
	listCollectedItemsServerFn(): Promise<CollectedItemRecord[]>;
}

const createCollectedItemsDal = (config: {
	entityName: string;
	getModel: (idb: IDBClient) => CollectedItemIDBDelegate;
	serverFns: CollectedItemServerFns;
}): GameCollectedItemsDal => {
	const { entityName, getModel, serverFns } = config;

	return {
		list: defineDalRead({
			queryKey: () => [entityName, "list"] as const,
			remote: async () => serverFns.listCollectedItemsServerFn(),
			local: async (_input, ctx) => {
				const userId = ctx.authUserId ?? ctx.anonUserId;
				if (!userId) return [];
				const idb = await getIDBClient();
				return getModel(idb).findMany({ where: { userId } });
			},
		}),

		collect: defineDalWrite({
			entity: entityName,
			operation: "upsert",
			invalidates: [entityName],
			buildIdempotencyKey: (input, ctx) =>
				`${entityName}:upsert:${ctx.anonUserId}:${input.itemId}:${input.itemName}`,
			remote: async (input) => serverFns.collectItemServerFn({ data: input }),
			local: async (input, ctx) => {
				const userId = ctx.authUserId ?? ctx.anonUserId;
				const idb = await getIDBClient();
				await idb.user.upsert({
					where: { id: userId },
					update: {},
					create: {
						id: userId,
						username: `_local_${userId}`,
						email: `_local_${userId}@local.invalid`,
						emailVerified: false,
					},
				});
				return getModel(idb).upsert({
					where: { userId_itemId: { userId, itemId: input.itemId } },
					update: {},
					create: { userId, itemId: input.itemId },
				});
			},
			sync: (op) => applyPendingOpServerFn({ data: op }),
		}),

		uncollect: defineDalWrite({
			entity: entityName,
			operation: "delete",
			invalidates: [entityName],
			buildIdempotencyKey: (input, ctx) =>
				`${entityName}:delete:${ctx.anonUserId}:${input.itemId}`,
			remote: async (input) => serverFns.uncollectItemServerFn({ data: input }),
			local: async (input, ctx) => {
				const userId = ctx.authUserId ?? ctx.anonUserId;
				const idb = await getIDBClient();
				await getModel(idb).deleteMany({
					where: { userId, itemId: input.itemId },
				});
				return { ok: true as const };
			},
			sync: (op) => applyPendingOpServerFn({ data: op }),
		}),
	};
};

export { createCollectedItemsDal };
