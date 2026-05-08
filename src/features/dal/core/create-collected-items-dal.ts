// Reusable DAL factory for any game's collected-item feature.
// Each game instantiates this with its own entity name, IDB model accessor, and server functions.

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

/**
 * Structural interface for the IDB model delegate.
 * Each game's Prisma IDB client is a different generated type; this interface
 * lets the factory work with any of them without importing game-specific types.
 */
interface CollectedItemIDBDelegate {
	findMany: (args: {
		where: { userId: string };
	}) => Promise<CollectedItemRecord[]>;
	findFirst: (args: {
		where: { userId: string; itemId: string };
	}) => Promise<CollectedItemRecord | null>;
	upsert: (args: {
		where: { userId_itemId: { userId: string; itemId: string } };
		update: object;
		create: { userId: string; itemId: string };
	}) => Promise<CollectedItemRecord>;
	deleteMany: (args: {
		where: { userId: string; itemId?: string };
	}) => Promise<unknown>;
}

/** Inferred type of the Prisma IDB client returned by getIDBClient(). */
type IDBClient = Awaited<ReturnType<typeof getIDBClient>>;

/** TanStack Start server functions injected per game. */
interface CollectedItemServerFns {
	collectItemServerFn(opts: {
		data: CollectItemInput;
	}): Promise<CollectedItemRecord>;
	uncollectItemServerFn(opts: {
		data: CollectItemInput;
	}): Promise<{ ok: true }>;
	listCollectedItemsServerFn(): Promise<CollectedItemRecord[]>;
	listCollectedItemsByUserIdServerFn(opts: {
		data: { userId: string };
	}): Promise<CollectedItemRecord[]>;
}

/**
 * Creates a GameCollectedItemsDal for a specific game.
 * `entityName` is the string key used in the sync-handler registry and for TanStack Query cache namespacing.
 * `getModel` extracts the game-specific IDB delegate from the shared IDB client.
 */
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
				`${entityName}:upsert:${ctx.anonUserId}:${input.itemId}`,
			describe: (input) => ({
				title: `Collected: ${input.itemName}`,
			}),
			getServerUpdatedAt: async (input, ctx) => {
				const userId = ctx.authUserId ?? ctx.anonUserId;
				const idb = await getIDBClient();
				const record = await getModel(idb).findFirst({
					where: { userId, itemId: input.itemId },
				});
				if (!record) return null;
				const t = record.updatedAt;
				return t instanceof Date ? t.toISOString() : (t ?? null);
			},
			remote: async (input) => serverFns.collectItemServerFn({ data: input }),
			local: async (input, ctx) => {
				const userId = ctx.authUserId ?? ctx.anonUserId;
				const idb = await getIDBClient();
				// IDB enforces a FK from collectedItem.userId → user.id, so we must
				// ensure a stub user row exists before writing the item row.
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
			sync: (op, options) =>
				applyPendingOpServerFn({ data: { op, force: options?.force } }),
		}),

		uncollect: defineDalWrite({
			entity: entityName,
			operation: "delete",
			invalidates: [entityName],
			buildIdempotencyKey: (input, ctx) =>
				`${entityName}:delete:${ctx.anonUserId}:${input.itemId}`,
			describe: (input) => ({
				title: `Uncollected: ${input.itemName}`,
			}),
			getServerUpdatedAt: async (input, ctx) => {
				const userId = ctx.authUserId ?? ctx.anonUserId;
				const idb = await getIDBClient();
				const record = await getModel(idb).findFirst({
					where: { userId, itemId: input.itemId },
				});
				if (!record) return null;
				const t = record.updatedAt;
				return t instanceof Date ? t.toISOString() : (t ?? null);
			},
			remote: async (input) => serverFns.uncollectItemServerFn({ data: input }),
			local: async (input, ctx) => {
				const userId = ctx.authUserId ?? ctx.anonUserId;
				const idb = await getIDBClient();
				// deleteMany (not delete) so this is a no-op if the item is already absent.
				await getModel(idb).deleteMany({
					where: { userId, itemId: input.itemId },
				});
				return { ok: true as const };
			},
			sync: (op, options) =>
				applyPendingOpServerFn({ data: { op, force: options?.force } }),
		}),

		listByUserIdServerFn: serverFns.listCollectedItemsByUserIdServerFn,
	};
};

export { createCollectedItemsDal };
