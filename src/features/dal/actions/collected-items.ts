import {
	defineDalRead,
	defineDalWrite,
} from "#/features/dal/core/define-action";
import type { DalContext } from "#/features/dal/core/types";
import {
	collectItemServerFn,
	listCollectedItemsServerFn,
	uncollectItemServerFn,
} from "#/features/dal/server/collected-items";
import { applyPendingOpServerFn } from "#/features/dal/server/sync";
import { getIDBClient } from "#/integrations/prisma-idb/idb-client";

interface CollectedItemInput {
	itemId: string;
}

async function resolveLocalUserId(ctx: DalContext): Promise<string> {
	return ctx.authUserId ?? ctx.anonUserId;
}

export const collectedItemActions = {
	list: defineDalRead<void, Array<{ userId: string; itemId: string }>>({
		queryKey: () => ["remnant2CollectedItem", "list"] as const,
		remote: async () => listCollectedItemsServerFn(),
		local: async (_input, ctx) => {
			const userId = await resolveLocalUserId(ctx);
			if (!userId) return [];
			const idb = await getIDBClient();
			return idb.remnant2CollectedItem.findMany({ where: { userId } });
		},
	}),

	collect: defineDalWrite<
		CollectedItemInput,
		{ userId: string; itemId: string }
	>({
		entity: "remnant2CollectedItem",
		operation: "upsert",
		invalidates: ["remnant2CollectedItem"],
		buildIdempotencyKey: (input, ctx) =>
			`remnant2CollectedItem:upsert:${ctx.anonUserId}:${input.itemId}`,
		remote: async (input) => collectItemServerFn({ data: input }),
		local: async (input, ctx) => {
			const userId = await resolveLocalUserId(ctx);
			const idb = await getIDBClient();
			// The IDB schema keeps User FK, so ensure a stub user record exists
			// before inserting the collected item to satisfy the FK constraint.
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
			return idb.remnant2CollectedItem.upsert({
				where: { userId_itemId: { userId, itemId: input.itemId } },
				update: {},
				create: { userId, itemId: input.itemId },
			});
		},
		sync: (op) => applyPendingOpServerFn({ data: op }),
	}),

	uncollect: defineDalWrite<CollectedItemInput, { ok: true }>({
		entity: "remnant2CollectedItem",
		operation: "delete",
		invalidates: ["remnant2CollectedItem"],
		buildIdempotencyKey: (input, ctx) =>
			`remnant2CollectedItem:delete:${ctx.anonUserId}:${input.itemId}`,
		remote: async (input) => uncollectItemServerFn({ data: input }),
		local: async (input, ctx) => {
			const userId = await resolveLocalUserId(ctx);
			const idb = await getIDBClient();
			await idb.remnant2CollectedItem.deleteMany({
				where: { userId, itemId: input.itemId },
			});
			return { ok: true as const };
		},
		sync: (op) => applyPendingOpServerFn({ data: op }),
	}),
};
