import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUserId } from "#/features/auth/dal/require-user.server";
import { createCollectedItemHandlers } from "#/features/dal/server/collected-item-handlers";
import { prisma } from "@/prisma";

const CollectInput = z.object({ itemId: z.string().min(1) });
const h = createCollectedItemHandlers(prisma.slayTheSpire2CollectedItem);

export const collectItemServerFn = createServerFn({ method: "POST" })
	.inputValidator((v: unknown) => CollectInput.parse(v))
	.handler(async ({ data }) => h.collect(data.itemId, await requireUserId()));

export const uncollectItemServerFn = createServerFn({ method: "POST" })
	.inputValidator((v: unknown) => CollectInput.parse(v))
	.handler(async ({ data }) => h.uncollect(data.itemId, await requireUserId()));

export const listCollectedItemsServerFn = createServerFn({
	method: "GET",
}).handler(async () => h.list(await requireUserId()));
