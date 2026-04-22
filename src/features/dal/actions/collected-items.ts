import {
	defineDalRead,
	defineDalWrite,
} from "#/features/dal/core/define-action";
import type { DalContext } from "#/features/dal/core/types";
import { applyPendingOpServerFn } from "#/features/dal/server/sync";
import {
	collectItemServerFn,
	listCollectedItemsServerFn,
	uncollectItemServerFn,
} from "#/features/dal/server/collected-items";
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

	collect: defineDalWrite<CollectedItemInput, { userId: string; itemId: string }>({
		entity: "remnant2CollectedItem",
		operation: "upsert",
		invalidates: ["remnant2CollectedItem"],
		buildIdempotencyKey: (input, ctx) =>
			`remnant2CollectedItem:upsert:${ctx.anonUserId}:${input.itemId}`,
		remote: async (input) => collectItemServerFn({ data: input }),
		local: async (input, ctx) => {
			const userId = await resolveLocalUserId(ctx);
			const idb = await getIDBClient();
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
