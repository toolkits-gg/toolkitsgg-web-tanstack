import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUserId } from "#/features/dal/server/require-user";
import { prisma } from "@/prisma";

const CollectInput = z.object({ itemId: z.string().min(1) });

export const collectItemServerFn = createServerFn({ method: "POST" })
	.inputValidator((v: unknown) => CollectInput.parse(v))
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		return prisma.remnant2CollectedItem.upsert({
			where: { userId_itemId: { userId, itemId: data.itemId } },
			update: {},
			create: { userId, itemId: data.itemId },
		});
	});

export const uncollectItemServerFn = createServerFn({ method: "POST" })
	.inputValidator((v: unknown) => CollectInput.parse(v))
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		await prisma.remnant2CollectedItem.deleteMany({
			where: { userId, itemId: data.itemId },
		});
		return { ok: true as const };
	});

export const listCollectedItemsServerFn = createServerFn({ method: "GET" })
	.handler(async () => {
		const userId = await requireUserId();
		return prisma.remnant2CollectedItem.findMany({ where: { userId } });
	});
